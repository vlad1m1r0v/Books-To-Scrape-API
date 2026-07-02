import type { Page } from 'playwright';

export async function scrapeGenres(page: Page): Promise<{ name: string; slug: string }[]> {
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
