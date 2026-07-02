import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { Page } from 'playwright';
import { BASE_URL } from '../config.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { scrapeGenres } from '../services/scraper.js';
import { GenresResponseSchema } from '../schemas/genres.js';

// eslint-disable-next-line @typescript-eslint/require-await
const genresRoutes: FastifyPluginAsyncZod = async _fastify => {
  _fastify.get(
    '/genres',
    {
      schema: {
        response: { 200: zodToJsonSchema(GenresResponseSchema) },
      },
    },
    async () => {
      const genres = await _fastify.scrapePage(`${BASE_URL}/`, async (page: Page) => {
        return scrapeGenres(page);
      });

      return { genres };
    }
  );
};

export default genresRoutes;
