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

// =====================================
// STAGE 1: FETCH AND CACHE HTML
// =====================================

async function fetchPage(url, cacheFile) {
	const cachePath = path.join(CACHE_DIR, cacheFile);

	try {
		const html = await fs.readFile(cachePath, 'utf8');
		console.log(`CACHE HIT: ${cacheFile}`);
		return html;
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	// Wait at least 500ms between actual HTTP requests.
	if (lastRequestTime) {
		const elapsed = Date.now() - lastRequestTime;
		await sleep(Math.max(0, 500 - elapsed));
	}

	lastRequestTime = Date.now();

	console.log(`FETCH: ${cacheFile}`);

	const response = await fetch(url, {
		headers: {
			'User-Agent': USER_AGENT,
		},
		signal: AbortSignal.timeout(30000),
	});

	if (response.status !== 200) {
		throw new Error(`HTTP ${response.status}: ${url}`);
	}

	const html = await response.text();

	await fs.mkdir(CACHE_DIR, { recursive: true });

	await fs.writeFile(cachePath, html, 'utf8');

	return html;
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
}

// =====================================
// MAIN
// =====================================

async function main() {
	// Stage 2: Discover books.
	const discoveredBooks = await discoverBooks();

	// Stage 3: Fetch and extract raw book records.
	const rawBooks = [];

	for (let i = 0; i < discoveredBooks.length; i++) {
		const book = discoveredBooks[i];

		const html = await fetchPage(book.product_url, `book-${i + 1}.html`);

		const record = extractBook(html, book.product_url, book.source_page);

		rawBooks.push(record);
	}

	console.log('\nFirst raw record:');
	console.log(JSON.stringify(rawBooks[0], null, 2));

	console.log(`\ndetail_pages=${rawBooks.length}`);

	// Stage 4: Normalize, validate, and save JSON.
	await saveBooks(rawBooks);
}

main().catch((error) => {
	console.error('Scraper failed:', error.message);
	process.exitCode = 1;
});
