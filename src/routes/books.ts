import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { scrapeBooks, scrapeBookDetail } from '../services/scraper.js';
import {
  BooksResponseSchema,
  BooksQuerySchema,
  BookDetailSchema,
  BookParamsSchema,
} from '../schemas/books.js';
import type { BooksQuery, BookParams } from '../schemas/books.js';

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

  fastify.get(
    '/books/:slug',
    {
      schema: {
        params: zodToJsonSchema(BookParamsSchema),
        response: { 200: zodToJsonSchema(BookDetailSchema) },
      },
    },
    async (req, reply) => {
      const { slug } = req.params as BookParams;

      const pageInstance = await fastify.browser.createPage();
      try {
        return await scrapeBookDetail(pageInstance, slug);
      } catch (err) {
        if (err instanceof Error && err.message === 'Book not found') {
          void reply.code(404).send({ error: 'Book not found' });
          return;
        }
        throw err;
      } finally {
        await fastify.browser.closePage(pageInstance);
      }
    }
  );
};

export default booksRoutes;
