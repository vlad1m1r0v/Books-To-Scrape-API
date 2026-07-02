import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';
import scalarUI from '@scalar/fastify-api-reference';
import swagger from '@fastify/swagger';
import { zodToJsonSchema } from 'zod-to-json-schema';
import genresRoutes from './routes/genres.js';
import booksRoutes from './routes/books.js';
import { HealthResponseSchema } from './schemas/health.js';

const fastify = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

declare module 'fastify' {
  interface FastifyInstance {
    browser: {
      get: () => Browser | null;
      createPage: () => Promise<Page>;
      closePage: (page: Page) => Promise<void>;
    };
    scrapePage: <T>(url: string, extractor: (page: Page) => Promise<T>) => Promise<T>;
  }
}

let browser: Browser | null = null;

async function initBrowser(): Promise<Browser> {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  fastify.log.info('Playwright Chromium browser launched globally');
  return browser;
}

async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    fastify.log.info('Playwright browser closed');
  }
}

async function createPage(): Promise<Page> {
  if (!browser) {
    throw new Error('Browser not initialized. Call initBrowser() first.');
  }
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
  return context.newPage();
}

async function closePage(page: Page): Promise<void> {
  try {
    await page.close();
    await page.context().close();
  } catch (error) {
    fastify.log.warn({ err: error }, 'Error closing page/context');
  }
}

fastify.decorate('browser', {
  get: () => browser,
  createPage,
  closePage,
});

fastify.decorate('scrapePage', async function <
  T,
>(this: Fastify.FastifyInstance, url: string, extractor: (page: Page) => Promise<T>): Promise<T> {
  const page = await this.browser.createPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    return await extractor(page);
  } finally {
    await this.browser.closePage(page);
  }
});

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'Books to Scrape API',
      version: '1.0.0',
      description: 'Web Scraping API for books.toscrape.com',
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
await fastify.register(scalarUI, {
  routePrefix: '/docs',
  configuration: {
    spec: { url: '/docs/openapi.json' },
  },
});

await fastify.register(genresRoutes, { prefix: '/api' });
await fastify.register(booksRoutes, { prefix: '/api' });

fastify.get(
  '/health',
  {
    schema: {
      response: { 200: zodToJsonSchema(HealthResponseSchema) },
    },
  },
  () => {
    return { status: 'ok', browser: browser ? 'connected' : 'disconnected' };
  }
);

async function main(): Promise<void> {
  try {
    await initBrowser();

    fastify.addHook('onClose', async () => {
      await closeBrowser();
    });

    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://0.0.0.0:${port}`);
    fastify.log.info(`Swagger UI available at http://0.0.0.0:${port}/docs`);
    fastify.log.info(`OpenAPI spec available at http://0.0.0.0:${port}/docs/openapi.json`);
  } catch (err) {
    fastify.log.error(err);
    await closeBrowser();
    process.exit(1);
  }
}

const shutdown = async (): Promise<void> => {
  try {
    await fastify.close();
    await closeBrowser();
  } catch {
    // ignore
  }
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

void main();
