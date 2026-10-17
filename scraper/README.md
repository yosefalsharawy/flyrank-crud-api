## Overview

A Node.js web scraper that collects book information from the first three catalogue pages of Books to Scrape.

The scraper discovers book URLs, downloads and caches HTML, extracts book details using Cheerio, validates records using Zod, and exports structured JSON files.

## Requirements

- Node.js 20+
- npm

## Installation

From the `scraper` directory:

```bash
npm ci
```

## Run

```bash
npm start
```

To test failure handling:

```bash
node src/index.js --test-failure
```

## Output Files

| File                     | Description                            |
| ------------------------ | -------------------------------------- |
| `output/books.json`      | Validated book records                 |
| `output/errors.json`     | Invalid records and validation reasons |
| `output/run-report.json` | Execution statistics and failed pages  |

## Book Record Schema

| Field               | Type                           |
| ------------------- | ------------------------------ |
| `title`             | String                         |
| `product_url`       | HTTPS URL                      |
| `price_text`        | String                         |
| `price_gbp`         | Number                         |
| `availability_text` | String                         |
| `rating_text`       | One, Two, Three, Four, or Five |
| `description`       | String or null                 |
| `source_page`       | HTTPS URL                      |
| `fetched_at`        | ISO datetime string            |

## Politeness

- Uses an identifying User-Agent.
- Waits at least 500 milliseconds between real HTTP requests.
- Uses a 30-second request timeout.
- Retries once on timeouts and HTTP 5xx errors.
- Does not retry HTTP 403 or 404 responses.
- Caches downloaded HTML to avoid repeated requests.

## Limitations

- Scrapes only the first three catalogue pages.
- Extracts data from static HTML.
- Depends on the website's current HTML structure and CSS selectors.
- Does not handle JavaScript-rendered pages.
- Does not require a browser because Books to Scrape serves the required content in its HTML responses.

## Ethical Considerations

- Prefer official APIs when available.
- Check the target website's rules and terms before scraping.
- Do not bypass logins, paywalls, or access restrictions.
- Do not attempt to circumvent blocks.
- Collect only the data needed for the assignment.

## Run Evidence

After a successful normal run, record the actual values from `output/run-report.json` here.

Expected successful result:

- Catalogue pages: 3
- Unique book URLs: 60
- Valid records: 60
- Invalid records: 0
- Failed pages: 0

The exact cache-hit count, network-fetch count, and duration depend on the run.
