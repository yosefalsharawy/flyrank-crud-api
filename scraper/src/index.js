const fs = require('node:fs/promises');
const path = require('node:path');
const cheerio = require('cheerio');

const START_URL = 'https://books.toscrape.com/';
const CACHE_DIR = path.join(__dirname, '../cache');

const USER_AGENT =
	'FlyRankInternship-A9/1.0 (+https://github.com/yosefalsharawy/flyrank-crud-api)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequestTime = 0;

async function fetchPage(url, pageNumber) {
	const cachePath = path.join(CACHE_DIR, `catalogue-page-${pageNumber}.html`);

	// First, try reading the local cache.
	try {
		const html = await fs.readFile(cachePath, 'utf8');
		console.log(`CACHE HIT: page ${pageNumber}`);
		return html;
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}

	// Wait at least 500 ms between actual requests.
	if (lastRequestTime) {
		const elapsed = Date.now() - lastRequestTime;
		await sleep(Math.max(0, 500 - elapsed));
	}

	lastRequestTime = Date.now();

	console.log(`FETCH: page ${pageNumber}`);

	const response = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT },
		signal: AbortSignal.timeout(10000),
	});

	if (response.status !== 200) {
		throw new Error(`HTTP ${response.status}: ${url}`);
	}

	const html = await response.text();

	await fs.mkdir(CACHE_DIR, { recursive: true });
	await fs.writeFile(cachePath, html, 'utf8');

	return html;
}

async function discoverBooks() {
	let pageUrl = START_URL;
	let cataloguePages = 0;
	const discoveredUrls = [];

	while (pageUrl && cataloguePages < 3) {
		const pageNumber = cataloguePages + 1;
		const html = await fetchPage(pageUrl, pageNumber);
		const $ = cheerio.load(html);

		// Find all book detail links on the current page.
		$('article.product_pod h3 a').each((_, element) => {
			const href = $(element).attr('href');

			if (href) {
				const absoluteUrl = new URL(href, pageUrl).href;
				discoveredUrls.push(absoluteUrl);
			}
		});

		cataloguePages++;

		// Follow the catalogue's Next link.
		const nextHref = $('li.next a').attr('href');

		pageUrl =
			nextHref && cataloguePages < 3 ? new URL(nextHref, pageUrl).href : null;
	}

	// Remove duplicate URLs.
	const uniqueUrls = [...new Set(discoveredUrls)];

	console.log(`catalogue_pages=${cataloguePages}`);
	console.log(`discovered=${discoveredUrls.length}`);
	console.log(`unique_urls=${uniqueUrls.length}`);

	return uniqueUrls;
}

discoverBooks().catch((error) => {
	console.error('Scraper failed:', error.message);
	process.exitCode = 1;
});
