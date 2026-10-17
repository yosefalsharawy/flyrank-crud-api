const fs = require('node:fs/promises');
const path = require('node:path');
const cheerio = require('cheerio');
const { z } = require('zod');

const START_URL = 'https://books.toscrape.com/';
const CACHE_DIR = path.join(__dirname, '../cache');
const OUTPUT_DIR = path.join(__dirname, '../output');

const USER_AGENT =
	'FlyRankInternship-A9/1.0 (+https://github.com/yosefalsharawy/flyrank-crud-api)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestTime = 0;

const stats = {
	pages_fetched: 0,
	cache_hits: 0,
	failed_pages: [],
};

// =====================================
// STAGE 1: FETCH AND CACHE HTML
// =====================================

async function fetchPage(url, cacheFile) {
	const cachePath = path.join(CACHE_DIR, cacheFile);

	// Check the cache first.
	try {
		const html = await fs.readFile(cachePath, 'utf8');

		stats.cache_hits++;
		console.log(`CACHE HIT: ${cacheFile}`);

		return html;
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}

	// Maximum two attempts: initial request + one retry.
	for (let attempt = 1; attempt <= 2; attempt++) {
		// Respect 500ms between real requests, including retries.
		if (lastRequestTime) {
			const elapsed = Date.now() - lastRequestTime;
			await sleep(Math.max(0, 500 - elapsed));
		}

		lastRequestTime = Date.now();

		console.log(`FETCH: ${cacheFile} (attempt ${attempt})`);

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': USER_AGENT,
				},
				signal: AbortSignal.timeout(30000),
			});

			stats.pages_fetched++;

			if (!response.ok) {
				const error = new Error(`HTTP ${response.status}: ${url}`);

				error.status = response.status;
				throw error;
			}

			const html = await response.text();

			await fs.mkdir(CACHE_DIR, { recursive: true });
			await fs.writeFile(cachePath, html, 'utf8');

			return html;
		} catch (error) {
			const isTimeout =
				error.name === 'TimeoutError' || error.name === 'AbortError';

			const isServerError = error.status >= 500 && error.status <= 599;

			const shouldRetry = attempt === 1 && (isTimeout || isServerError);

			if (shouldRetry) {
				console.log(`RETRY: ${url} - ${error.message}`);
				continue;
			}

			throw error;
		}
	}
}

// =====================================
// STAGE 2: DISCOVER BOOK URLS
// =====================================

async function discoverBooks() {
	let pageUrl = START_URL;
	const books = [];

	for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
		const html = await fetchPage(pageUrl, `catalogue-page-${pageNumber}.html`);

		const $ = cheerio.load(html);

		$('article.product_pod h3 a').each((_, element) => {
			const href = $(element).attr('href');

			if (href) {
				books.push({
					product_url: new URL(href, pageUrl).href,
					source_page: pageUrl,
				});
			}
		});

		if (pageNumber < 3) {
			const nextHref = $('li.next a').attr('href');

			if (!nextHref) {
				throw new Error(`Next link missing on catalogue page ${pageNumber}`);
			}

			pageUrl = new URL(nextHref, pageUrl).href;
		}
	}

	// Deduplicate books using their absolute product URLs.
	const uniqueBooks = [
		...new Map(books.map((book) => [book.product_url, book])).values(),
	];

	console.log(
		`catalogue_pages=3 discovered=${books.length} unique_urls=${uniqueBooks.length}`,
	);

	return uniqueBooks;
}

// =====================================
// STAGE 3: EXTRACT RAW BOOK DETAILS
// =====================================

function extractBook(html, productUrl, sourcePage) {
	const $ = cheerio.load(html);

	const title = $('.product_main h1').first().text().trim();

	const priceText = $('.product_main .price_color').first().text().trim();

	const availabilityText = $('.product_main .availability')
		.first()
		.text()
		.replace(/\s+/g, ' ')
		.trim();

	const ratingClass = $('.product_main .star-rating').attr('class') || '';

	const ratingText =
		ratingClass
			.split(/\s+/)
			.find((value) =>
				['One', 'Two', 'Three', 'Four', 'Five'].includes(value),
			) || null;

	const description =
		$('#product_description').next('p').first().text().trim() || null;

	return {
		title,
		product_url: productUrl,
		price_text: priceText,
		availability_text: availabilityText,
		rating_text: ratingText,
		description,
		source_page: sourcePage,
		fetched_at: new Date().toISOString(),
	};
}

// =====================================
// STAGE 4: NORMALIZE AND VALIDATE
// =====================================

const bookSchema = z.object({
	title: z.string().trim().min(1),

	product_url: z.url().startsWith('https://'),

	price_text: z.string().trim().min(1),

	price_gbp: z.number().finite().nonnegative(),

	availability_text: z.string().trim().min(1),

	rating_text: z.enum(['One', 'Two', 'Three', 'Four', 'Five']),

	description: z.string().nullable(),

	source_page: z.url().startsWith('https://'),

	fetched_at: z.iso.datetime(),
});

function normalizeBook(rawBook) {
	const priceText = rawBook.price_text.trim();

	// Convert "£51.77" into the number 51.77.
	const priceMatch = /^£(\d+(?:\.\d{1,2})?)$/.exec(priceText);

	return {
		...rawBook,
		product_url: new URL(rawBook.product_url).href,
		price_text: priceText,
		price_gbp: priceMatch ? Number(priceMatch[1]) : NaN,
	};
}

async function saveBooks(rawBooks) {
	const validBooks = [];
	const errors = [];
	const seenUrls = new Set();

	for (const rawBook of rawBooks) {
		let normalizedBook;

		// Normalize each raw record.
		try {
			normalizedBook = normalizeBook(rawBook);
		} catch (error) {
			errors.push({
				product_url: rawBook.product_url,
				reason: error.message,
			});

			continue;
		}

		// Validate the normalized record using Zod.
		const result = bookSchema.safeParse(normalizedBook);

		if (!result.success) {
			errors.push({
				product_url: rawBook.product_url,
				reason: result.error.issues.map(
					(issue) => `${issue.path.join('.')}: ${issue.message}`,
				),
			});

			continue;
		}

		const book = result.data;

		// Skip duplicate book URLs.
		if (seenUrls.has(book.product_url)) {
			continue;
		}

		seenUrls.add(book.product_url);
		validBooks.push(book);
	}

	// Create the output directory if it doesn't exist.
	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	// Save valid records.
	await fs.writeFile(
		path.join(OUTPUT_DIR, 'books.json'),
		JSON.stringify(validBooks, null, 2),
		'utf8',
	);

	// Save invalid records with their reasons.
	await fs.writeFile(
		path.join(OUTPUT_DIR, 'errors.json'),
		JSON.stringify(errors, null, 2),
		'utf8',
	);

	console.log(`valid_records=${validBooks.length}`);
	console.log(`invalid_records=${errors.length}`);

	return {
		valid_records: validBooks.length,
		invalid_records: errors.length,
	};
}

// =====================================
// MAIN
// =====================================

async function main() {
	const startTime = new Date();
	const startMs = Date.now();

	const discoveredBooks = await discoverBooks();

	// Stage 5: Add one deliberately invalid URL for testing.
	const TEST_FAILURE = process.argv.includes('--test-failure');

	if (TEST_FAILURE) {
		discoveredBooks.push({
			product_url:
				'https://books.toscrape.com/catalogue/this-book-does-not-exist-999999.html',
			source_page: START_URL,
		});
	}

	const rawBooks = [];
	let detailPages = 0;

	for (let i = 0; i < discoveredBooks.length; i++) {
		const book = discoveredBooks[i];

		try {
			const html = await fetchPage(book.product_url, `book-${i + 1}.html`);

			detailPages++;

			const record = extractBook(html, book.product_url, book.source_page);

			rawBooks.push(record);
		} catch (error) {
			console.error(`FAILED: ${book.product_url} - ${error.message}`);

			stats.failed_pages.push({
				url: book.product_url,
				reason: error.message,
			});
		}
	}

	console.log(`\ndetail_pages=${detailPages}`);

	// Stage 4: Validate and save successful records.
	const result = await saveBooks(rawBooks);

	// Stage 5: Generate run report.
	const report = {
		started_at: startTime.toISOString(),
		duration_ms: Date.now() - startMs,
		pages_fetched: stats.pages_fetched,
		cache_hits: stats.cache_hits,
		valid_records: result.valid_records,
		invalid_records: result.invalid_records,
		failed_pages: stats.failed_pages,
	};

	await fs.writeFile(
		path.join(OUTPUT_DIR, 'run-report.json'),
		JSON.stringify(report, null, 2),
		'utf8',
	);

	console.log('\nRun report:');
	console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
	console.error('Scraper failed:', error.message);
	process.exitCode = 1;
});
