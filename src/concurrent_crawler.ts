import pLimit, { LimitFunction } from "p-limit";
import { ExtractedPageData, extractPageData, normalizeURL } from "./crawl";

export class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, ExtractedPageData>;
  private limit: LimitFunction;
  private maxPages: number;
  private shouldStop = false;
  private allTasks = new Set<Promise<void>>();

  constructor(
    baseURL: string,
    concurrencyLimit: number = 5,
    maxPages: number = 100
  ) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(concurrencyLimit);
    this.maxPages = Math.max(1, maxPages);
  }

  private canCrawl(normalizedURL: string): boolean {
    if (this.shouldStop) return false;

    if (normalizedURL in this.pages) return false;

    // verifico se il numero di pagine analizzate rimane entro il limite massimo stabilito
    if (Object.keys(this.pages).length >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      return false;
    }

    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    return await this.limit(async () => {
      try {
        const res = await fetch(currentURL, {
          headers: {
            "User-Agent": "BootCrawler/1.0",
          }
        });
        if (!res.ok) {
          console.error(`Error ${res.status} fetching the URL "${currentURL}"`);
          return "";
        }

        const ct = res.headers.get("Content-Type") || "";
        if (!ct.includes("text/html")) {
          console.error("Wrong content type:", ct);
          return "";
        };

        return res.text();
      } catch (e) {
        console.error(`Error connecting to URL "${currentURL}":`, e);
        return "";
      }
    })
  }

  private async crawlPage(currentURL: string): Promise<void> {
    if (this.shouldStop) return;

    // verifico se stesso dominio
    const urlObj = new URL(currentURL);
    const baseObj = new URL(this.baseURL);
    if (urlObj.hostname !== baseObj.hostname) return;

    const normalizedURL = normalizeURL(currentURL);
    if (!this.canCrawl(normalizedURL)) return;

    console.log(`crawling ${currentURL}`);

    let html = "";
    try {
      html = await this.getHTML(currentURL);
      if (!html) return;
    } catch (e) {
      console.error(`${(e as Error).message}`);
      return;
    }

    const pageData = extractPageData(html, currentURL);
    this.pages[normalizedURL] = pageData;
    for (const url of pageData.outgoing_links) {
      if (this.shouldStop) break;

      const task = this.crawlPage(url);
      this.allTasks.add(task);

      task.finally(() => {
        this.allTasks.delete(task);
      })
    }
  }

  public async crawl(): Promise<Record<string, ExtractedPageData>> {
    console.log("Starting crawl at:", this.baseURL);

    const initialTask = this.crawlPage(this.baseURL);
    this.allTasks.add(initialTask);

    initialTask.finally(() => this.allTasks.delete(initialTask));

    while (this.allTasks.size > 0) {
      await Promise.allSettled(Array.from(this.allTasks));
    }

    return this.pages;
  }
}
