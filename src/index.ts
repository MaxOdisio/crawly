import { argv } from "node:process";
import { crawlSiteAsync } from "./crawl";
import { writeJSONReport } from "./report";

async function main() {
  const args = argv.slice(2);
  if (args.length < 1) {
    console.error("You have to pass arguments");
    process.exit(1);
  }
  if (args.length > 3) {
    console.error("ERROR: Too many parameters.");
    console.log("Usage: npm run start <url> <maxConcurrency> <maxPages>");
    process.exit(1);
  }
  const baseURL = args[0];
  const maxConcurrency = Number(args[1]);
  const maxPages = Number(args[2]);

  if (!baseURL || isNaN(maxConcurrency) || isNaN(maxPages)) {
    console.error("ERROR: Invalid or missing parameters.");
    console.log("Usage: npm run start <url> <maxConcurrency> <maxPages>");
    process.exit(1);
  }

  console.log("Scraping website:", baseURL);
  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
  console.log("Finished crawling.");
  const firstPage = Object.values(pages)[0];
  if (firstPage) {
    console.log(`First page record: ${firstPage["url"]} - ${firstPage["heading"]}`)
  }
  writeJSONReport(pages, "report.json");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
