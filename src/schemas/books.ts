import { z } from 'zod';

export const BookSchema = z.object({
  thumbnail: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.string(),
  inStock: z.boolean(),
  rating: z.number().min(1).max(5),
});

export const BooksResponseSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  recordsPerPage: z.number(),
  totalRecords: z.number(),
  books: z.array(BookSchema),
});

export const BooksQuerySchema = z.object({
  genre: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type Book = z.infer<typeof BookSchema>;
export type BooksResponse = z.infer<typeof BooksResponseSchema>;
export type BooksQuery = z.infer<typeof BooksQuerySchema>;
