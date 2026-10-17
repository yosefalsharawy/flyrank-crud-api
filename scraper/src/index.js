const fs = require('node:fs/promises');
const path = require('node:path');
const cheerio = require('cheerio');

const START_URL = 'https://books.toscrape.com/';
const CACHE_DIR = path.join(__dirname, '../cache');

const USER_AGENT =
	'FlyRankInternship-A9/1.0 (+https://github.com/yosefalsharawy/flyrank-crud-api)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestTime = 0;

// Reusable fetch function for catalogue and detail pages.
async function fetchPage(url, cacheFile) {
	const cachePath = path.join(CACHE_DIR, cacheFile);

	try {
		const html = await fs.readFile(cachePath, 'utf8');
		console.log(`CACHE HIT: ${cacheFile}`);
		return html;
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}

	// Respect the minimum delay between network requests.
	if (lastRequestTime) {
		const elapsed = Date.now() - lastRequestTime;
		await sleep(Math.max(0, 500 - elapsed));
	}

	lastRequestTime = Date.now();

	console.log(`FETCH: ${cacheFile}`);

	const response = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT },
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

// Stage 2: Discover books from three catalogue pages.
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
				throw new Error(`Next link missing on page ${pageNumber}`);
			}

			pageUrl = new URL(nextHref, pageUrl).href;
		}
	}

	// Deduplicate by product URL.
	const uniqueBooks = [
		...new Map(books.map((book) => [book.product_url, book])).values(),
	];

	console.log(
		`catalogue_pages=3 discovered=${books.length} unique_urls=${uniqueBooks.length}`,
	);

	return uniqueBooks;
}

// Stage 3: Extract one book's raw details.
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

async function main() {
	const discoveredBooks = await discoverBooks();
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
}

main().catch((error) => {
	console.error('Scraper failed:', error.message);
	process.exitCode = 1;
});
