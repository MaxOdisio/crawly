import * as fs from "fs";
import * as path from "path";
import { ExtractedPageData } from "./crawl";

export function writeJSONReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.json",
): void {
  if (!pageData || Object.keys(pageData).length === 0) {
    console.log("No data to write JSON");
    return;
  }

  const sorted = Object.values(pageData).sort((a, b) => a.url.localeCompare(b.url));
  const serialized = JSON.stringify(sorted, null, 2);
  const fullPath = path.resolve(process.cwd(), filename);

  try {
    fs.writeFileSync(fullPath, serialized, "utf8");
    console.log("File correctly saved in:", fullPath);
  } catch (e) {
    console.error("Error saving file:", (e as Error).message);
    return;
  }
  return;
};
