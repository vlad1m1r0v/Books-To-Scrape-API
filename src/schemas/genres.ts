import { z } from 'zod';

export const GenreSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const GenresResponseSchema = z.object({
  genres: z.array(GenreSchema),
});

export type Genre = z.infer<typeof GenreSchema>;
export type GenresResponse = z.infer<typeof GenresResponseSchema>;
