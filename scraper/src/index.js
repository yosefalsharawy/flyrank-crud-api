const fs = require('node:fs/promises');
const path = require('node:path');

const PAGE_URL = 'https://books.toscrape.com/';
const CACHE_PATH = path.join(__dirname, '../cache/catalogue-page-1.html');

async function fetchPage() {
	// Check whether the HTML was downloaded previously.
	try {
		const cachedHTML = await fs.readFile(CACHE_PATH, 'utf8');

		console.log('CACHE HIT');
		console.log(`Bytes: ${Buffer.byteLength(cachedHTML, 'utf8')}`);

		return cachedHTML;
	} catch (error) {
		// Only download if the cache file does not exist.
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	// Download the HTML from the website.
	console.log('FETCH');

	const response = await fetch(PAGE_URL, {
		headers: {
			'User-Agent': 'FlyRankInternship-A9/1.0 (Educational Scraper)',
		},
		signal: AbortSignal.timeout(10000),
	});

	// Check the HTTP response status.
	if (response.status !== 200) {
		throw new Error(`HTTP request failed: ${response.status}`);
	}

	const html = await response.text();

	// Create the cache directory if needed.
	await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });

	// Save the downloaded HTML locally.
	await fs.writeFile(CACHE_PATH, html, 'utf8');

	console.log(`Bytes: ${Buffer.byteLength(html, 'utf8')}`);

	return html;
}

fetchPage().catch((error) => {
	console.error('Scraper failed:', error.message);
	process.exitCode = 1;
});
