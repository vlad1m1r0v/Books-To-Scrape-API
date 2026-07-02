import type { Page } from 'playwright';
import type { Genre } from '../schemas/genres.js';
import type { Book } from '../schemas/books.js';
import { BASE_URL } from '../config.js';

export async function scrapeGenres(page: Page): Promise<Genre[]> {
  const genreElements = await page.locator('.side_categories .nav-list > li > ul > li > a').all();

  const genres = await Promise.all(
    genreElements.map(async element => {
      const name = (await element.textContent())?.trim() ?? '';
      const href = (await element.getAttribute('href')) ?? '';
      const slugMatch = href.match(/category\/books\/([^/]+)\//);
      const slug = slugMatch ? slugMatch[1] : '';
      return { name, slug };
    })
  );

  return genres.filter(g => g.name && g.slug);
}

export async function scrapeBooks(
  page: Page,
  genre?: string,
  pageNum?: number
): Promise<{
  currentPage: number;
  totalPages: number;
  recordsPerPage: number;
  totalRecords: number;
  books: Book[];
}> {
  const url = buildBooksUrl(genre, pageNum);
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  if (response && response.status() === 404) {
    return {
      currentPage: pageNum ?? 1,
      totalPages: 0,
      recordsPerPage: 20,
      totalRecords: 0,
      books: [],
    };
  }

  const bookElements = await page.locator('article.product_pod').all();

  const books = await Promise.all(
    bookElements.map(async element => {
      const name = (await element.locator('h3 a').getAttribute('title')) ?? '';
      const href = (await element.locator('h3 a').getAttribute('href')) ?? '';
      const slugMatch = href.match(/([^/]+)\/index\.html$/);
      const slug = slugMatch ? slugMatch[1] : '';

      const thumbnail = (await element.locator('img.thumbnail').getAttribute('src')) ?? '';
      const thumbnailUrl = thumbnail ? new URL(thumbnail, url).href : '';

      const price = (await element.locator('.price_color').textContent()) ?? '';

      const availabilityEl = element.locator('.availability');
      const availabilityClass = (await availabilityEl.getAttribute('class')) ?? '';
      const inStock = availabilityClass.includes('instock');

      const ratingClass = (await element.locator('p.star-rating').getAttribute('class')) ?? '';
      const ratingMatch = ratingClass.match(/One|Two|Three|Four|Five/);
      const rating = ratingMatch
        ? ['One', 'Two', 'Three', 'Four', 'Five'].indexOf(ratingMatch[0]) + 1
        : 0;

      return { thumbnail: thumbnailUrl, name, slug, price, inStock, rating };
    })
  );

  const pagerText = (await page.locator('.current').textContent()) ?? '';
  const totalPagesMatch = pagerText.match(/Page \d+ of (\d+)/);
  const totalPages = totalPagesMatch ? Number(totalPagesMatch[1]) : 1;

  const formText = (await page.locator('form.form-horizontal strong').first().textContent()) ?? '';
  const totalRecords = formText ? Number(formText.replace(/\D/g, '')) : books.length;

  return {
    currentPage: pageNum ?? 1,
    totalPages,
    recordsPerPage: 20,
    totalRecords,
    books,
  };
}

function buildBooksUrl(genre?: string, pageNum?: number): string {
  const currentPage = pageNum ?? 1;

  if (!genre) {
    return `${BASE_URL}/catalogue/page-${currentPage}.html`;
  }

  return `${BASE_URL}/catalogue/category/books/${genre}/page-${currentPage}.html`;
}
