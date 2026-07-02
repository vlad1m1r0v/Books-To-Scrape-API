import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import type { FastifyInstance } from 'fastify';
import type { Page } from 'playwright';
import { BASE_URL } from '../config.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { scrapeGenres } from '../services/scraper.js';
import { z } from 'zod';

const GenreSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

const GenresResponseSchema = z.object({
  genres: z.array(GenreSchema),
});

const genresRoutes: FastifyPluginCallbackZod = (fastify: FastifyInstance) => {
  fastify.get(
    '/genres',
    {
      schema: {
        response: { 200: zodToJsonSchema(GenresResponseSchema) },
      },
    },
    async () => {
      const genres = await fastify.scrapePage(`${BASE_URL}/`, async (page: Page) => {
        return scrapeGenres(page);
      });

      return { genres };
    }
  );
};

export default genresRoutes;
