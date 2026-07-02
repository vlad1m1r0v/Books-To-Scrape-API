import { z } from 'zod';

export const BookSchema = z.object({
  thumbnailUrl: z.string(),
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

export const ProductTypeSchema = z
  .enum(['Books', 'Magazine', 'Journal', 'Comic', 'Manuscript', 'Newspaper'])
  .catch('Books');

export const BookDetailSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
  price: z.string(),
  available: z.number().int().min(0),
  rating: z.number().min(1).max(5),
  description: z.string().nullable(),
  upc: z.string(),
  productType: ProductTypeSchema,
  priceWithTax: z.string(),
  priceWithoutTax: z.string(),
  tax: z.string(),
  numReviews: z.number().int().min(0),
});

export const BookParamsSchema = z.object({
  slug: z.string(),
});

export type Book = z.infer<typeof BookSchema>;
export type BooksResponse = z.infer<typeof BooksResponseSchema>;
export type BooksQuery = z.infer<typeof BooksQuerySchema>;
export type BookDetail = z.infer<typeof BookDetailSchema>;
export type BookParams = z.infer<typeof BookParamsSchema>;
