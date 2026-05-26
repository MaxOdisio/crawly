# 🕷️ crawly

A lightweight **CLI Web Crawler** written in TypeScript. Given a starting URL, crawly recursively visits pages, extracts links, and reports results — all from your terminal.

## Features

- Recursive link crawling from a seed URL
- Concurrent requests via `p-limit` for controlled parallelism
- HTML parsing with `jsdom` (no headless browser needed)
- Written in TypeScript with strict mode enabled
- Fast test suite powered by `vitest`

## Requirements

- Node.js (see `.nvmrc` for the recommended version)
- npm

## Installation

```bash
git clone https://github.com/MaxOdisio/crawly.git
cd crawly
npm install
```

## Usage

```bash
npm run start <url> <maxConcurrency> <maxPages>
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Run the crawler with `tsx` |
| `npm test` | Run the test suite with `vitest` |

## Project Structure

```
crawly/
├── src/           # TypeScript source files
├── package.json
├── tsconfig.json
└── .nvmrc
```

## Tech Stack

| Package | Role |
|---|---|
| `jsdom` | DOM parsing and link extraction |
| `p-limit` | Concurrency control for parallel fetches |
| `tsx` | Run TypeScript directly without a build step |
| `typescript` | Strict static typing |
| `vitest` | Unit testing |

## License

ISC
