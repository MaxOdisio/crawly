import { expect, test } from 'vitest'
import { extractPageData, getFirstParagraphFromHTML, getHeadingFromHTML, getImagesFromHTML, getURLsFromHTML, normalizeURL } from './crawl'

test("normalizeURL protocol", () => {
  const input = "https://crawler-test.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL slash", () => {
  const input = "https://crawler-test.com/path/";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL capitals", () => {
  const input = "https://CRAWLER-TEST.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL http", () => {
  const input = "http://CRAWLER-TEST.com/path";
  const actual = normalizeURL(input);
  const expected = "crawler-test.com/path";
  expect(actual).toEqual(expected);
});

test("normalizeURL handles invalid input", () => {
  const input = "not a real url";
  const actual = normalizeURL(input);
  const expected = "not a real url"
  expect(actual).toEqual(expected);
})

test("getHeadingFromHTML h1 text", () => {
  const input = `<html>
  <body>
    <h1>Welcome to Boot.dev</h1>
    <main>
      <p>Learn to code by building real projects.</p>
      <p>This is the second paragraph.</p>
    </main>
  </body>
</html>`;
  const actual = getHeadingFromHTML(input);
  const expected = "Welcome to Boot.dev";
  expect(actual).toEqual(expected);
})

test("getHeadingFromHTML h2 text", () => {
  const input = `<html>
  <body>
    <h2>The best site in the world</h2>
    <main>
      <p>Learn to code by building real projects.</p>
      <p>This is the second paragraph.</p>
    </main>
  </body>
</html>`;
  const actual = getHeadingFromHTML(input);
  const expected = "The best site in the world";
  expect(actual).toEqual(expected);
})

test("getHeadingFromHTML no h1 and h2", () => {
  const input = `<html>
  <body>
    <main>
      <p>Learn to code by building real projects.</p>
      <p>This is the second paragraph.</p>
    </main>
  </body>
</html>`;
  const actual = getHeadingFromHTML(input);
  const expected = "";
  expect(actual).toEqual(expected);
})

test("getFirstParagraphFromHTML first p", () => {
  const input = `<html>
  <body>
    <main>
      <p>Learn to code by building real projects.</p>
      <p>This is the second paragraph.</p>
    </main>
  </body>
</html>`;
  const actual = getFirstParagraphFromHTML(input);
  const expected = "Learn to code by building real projects.";
  expect(actual).toEqual(expected);
})

test("getFirstParagraphFromHTML main priority", () => {
  const input = `<html>
  <body>
    <p>This is an outside paragraph.</p>
    <main>
      <p>Learn to code by building real projects.</p>
    </main>
  </body>
</html>`;
  const actual = getFirstParagraphFromHTML(input);
  const expected = "Learn to code by building real projects.";
  expect(actual).toEqual(expected);
})

test("getFirstParagraphFromHTML no p", () => {
  const input = `<html>
  <body>
    <main>
      <h2>Learn to code by building real projects.</h2>
    </main>
  </body>
</html>`;
  const actual = getFirstParagraphFromHTML(input);
  const expected = "";
  expect(actual).toEqual(expected);
})

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
})

test("getURLsFromHTML more absolutes", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>First link</span></a><a href="/path/two"><span>Second link</span></a><a href="/path/three"><span>Third link</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one", "https://crawler-test.com/path/two", "https://crawler-test.com/path/three"];

  expect(actual).toEqual(expected);
})

test("getURLsFromHTML external link", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="https://external-link.com"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://external-link.com/"];

  expect(actual).toEqual(expected);
})

test("getURLsFromHTML mixed links", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="https://external-link.com"><span>Boot.dev</span></a><a href="/path/one"><span>Internal link</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://external-link.com/", "https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
})

test("getURLsFromHTML no link", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><span>Boot.dev</span></body></html>`;

  const actual: string[] = getURLsFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
})

test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="https://imagelink.com/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://imagelink.com/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML no image", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><p>This body contains no image.</p></body></html>`;

  const actual: string[] = getImagesFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});


test("getImagesFromHTML many", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="https://imagelink.com/logo.png" alt="Logo"><img src="/header.png" alt="Header"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://imagelink.com/logo.png", "https://crawler-test.com/header.png"];

  expect(actual).toEqual(expected);
});

test("extractPageData basic", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData no headings", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData no paragraphs", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData no links", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: [],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData no images", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: [],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData h2 heading", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h2>Test Subtitle</h2>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Subtitle",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData many links", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <a href="/link2">Link 2</a>
      <a href="/link3">Link 3</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1", "https://crawler-test.com/link2", "https://crawler-test.com/link3"],
    image_urls: ["https://crawler-test.com/image1.jpg"],
  };

  expect(actual).toEqual(expected);
});

test("extractPageData many images", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
      <img src="/image2.jpg" alt="Image 2">
      <img src="/image3.jpg" alt="Image 3">
    </body></html>
  `;

  const actual = extractPageData(inputBody, inputURL);
  const expected = {
    url: "https://crawler-test.com",
    heading: "Test Title",
    first_paragraph: "This is the first paragraph.",
    outgoing_links: ["https://crawler-test.com/link1"],
    image_urls: ["https://crawler-test.com/image1.jpg", "https://crawler-test.com/image2.jpg", "https://crawler-test.com/image3.jpg"],
  };

  expect(actual).toEqual(expected);
});
