import { JSDOM } from 'jsdom';
import { ConcurrentCrawler } from './concurrent_crawler';

export type ExtractedPageData = {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
}

export function normalizeURL(url: string): string {
  let input = url.trim();

  // se non contiene il prefisso quando uso la classe URL
  // viene generato un errore che manda in crash il programma.
  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    input = "https://" + input;
  }

  try {
    const urlObj = new URL(input);
    let fullPath = `${urlObj.host.toLowerCase()}${urlObj.pathname}`;
    if (fullPath.slice(-1) == "/") {
      fullPath = fullPath.slice(0, -1);
    }

    return fullPath;
  } catch (e) {
    console.error("invalid URL:", url);
    return url.trim();
  }

}

export function getHeadingFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const h1 = doc.querySelector("h1") ?? doc.querySelector("h2");
    return (h1?.textContent ?? "").trim();
  } catch {
    return "";
  }
};

export function getFirstParagraphFromHTML(html: string): string {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const main = doc.querySelector("main");
    const p = main?.querySelector("p") ?? doc.querySelector("p");
    return (p?.textContent ?? "").trim();
  } catch {
    return "";
  }
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const as = doc.querySelectorAll("a");
    const links: string[] = [];

    as.forEach((a) => {
      const href = a.getAttribute("href");

      if (href) {
        try {
          let absoluteURL = new URL(href, baseURL).href; // N.B. l'ultimo href indica l'attributo di URL, non la variabile!

          // Se l'URL finisce con "/" e non è la root del sito, lo togliamo
          if (absoluteURL.endsWith('/') && absoluteURL.split('/').length > 4) {
            absoluteURL = absoluteURL.slice(0, -1);
          }

          links.push(absoluteURL);
        } catch {
          console.warn(`Invalid link skipped: ${href}`)
        }
      }
    });
    return links;
  } catch (e) {
    console.error("failed to parse HTML:", e);
    return []
  }
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const images = doc.querySelectorAll("img");
    const links: string[] = [];

    images.forEach((img) => {
      const imgLink = img.getAttribute("src");

      if (imgLink) {
        try {
          let absoluteURL = new URL(imgLink, baseURL).href;
          links.push(absoluteURL);
        } catch {
          console.warn(`Invalid img link skipped: ${imgLink}`)
        }
      }
    });
    return links;
  } catch (e) {
    console.error("failed to parse HTML:", e);
    return [];
  }
};

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
  const extracted: ExtractedPageData = {
    url: pageURL,
    heading: "",
    first_paragraph: "",
    outgoing_links: [],
    image_urls: [],
  }

  try {
    const heading = getHeadingFromHTML(html);
    const firstParagraph = getFirstParagraphFromHTML(html);
    const links = getURLsFromHTML(html, pageURL);
    const images = getImagesFromHTML(html, pageURL);

    extracted.heading = heading;
    extracted.first_paragraph = firstParagraph;
    extracted.outgoing_links = links;
    extracted.image_urls = images;

    return extracted;
  } catch (e) {
    console.error("failed to parse HTML:", e);
    return extracted;
  }
};

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 5,
  maxPages: number = 100
): Promise<Record<string, ExtractedPageData>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  return await crawler.crawl();
}
