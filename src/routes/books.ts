import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { scrapeBooks } from '../services/scraper.js';
import { BooksResponseSchema, BooksQuerySchema } from '../schemas/books.js';
import type { BooksQuery } from '../schemas/books.js';

// eslint-disable-next-line @typescript-eslint/require-await
const booksRoutes: FastifyPluginAsyncZod = async fastify => {
  fastify.get(
    '/books',
    {
      schema: {
        querystring: zodToJsonSchema(BooksQuerySchema),
        response: { 200: zodToJsonSchema(BooksResponseSchema) },
      },
    },
    async req => {
      const { genre, page } = req.query as BooksQuery;

      const pageInstance = await fastify.browser.createPage();
      try {
        return await scrapeBooks(pageInstance, genre, page);
      } finally {
        await fastify.browser.closePage(pageInstance);
      }
    }
  );
};

export default booksRoutes;
