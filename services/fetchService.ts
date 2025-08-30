
// IMPORTANT: This service uses a public CORS proxy to fetch website content.
// This is necessary because web browsers block client-side requests to different origins (CORS policy).
// For production use, a self-hosted CORS proxy is recommended.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Fetches the raw HTML content of a given URL via a CORS proxy.
 * @param url The URL of the website to fetch.
 * @returns A promise that resolves to the HTML string.
 */
export async function getPageHtml(url: string): Promise<string> {
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Fetches the HTML of a page and extracts the text content of elements matching a selector.
 * @param url The URL of the website.
 * @param selector The CSS selector (e.g., '.my-class', '#my-id', 'p').
 * @returns A promise that resolves to an array of text contents from matching elements.
 */
export async function getElementContent(url: string, selector: string): Promise<string[]> {
  const html = await getPageHtml(url);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = doc.querySelectorAll(selector);
  return Array.from(elements).map(el => el.textContent?.trim() || '');
}
