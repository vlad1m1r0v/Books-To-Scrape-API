# Books to Scrape API

A web scraping REST API built as a training/portfolio project. Scrapes book data from [books.toscrape.com](https://books.toscrape.com/) - a static sandbox site designed for scraping practice.

## Project Overview

This API provides structured access to book catalog data by scraping the target website. It demonstrates:
- Single browser instance lifecycle management (no per-request browser launches)
- Type-safe endpoints with Zod validation
- Auto-generated OpenAPI/Swagger documentation
- Clean architecture with separation of concerns

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| Framework | Fastify 4.x |
| Validation | Zod + fastify-type-provider-zod |
| Scraping | Playwright (Chromium) |
| Package Manager | pnpm |
| API Docs | @fastify/swagger + @scalar/fastify-api-reference |
| Dev Tools | tsx, ESLint, Prettier, Husky, lint-staged |

## Folder Structure

```
src/
├── index.ts                 # Server entry, browser lifecycle, plugin registration
├── config.ts                # Constants (BASE_URL)
├── routes/
│   ├── genres.ts            # GET /api/genres
│   └── books.ts             # GET /api/books, GET /api/books/:slug
├── services/
│   └── scraper.ts           # Playwright scraping logic
└── schemas/
    ├── genres.ts            # Zod schemas for genres
    ├── books.ts             # Zod schemas for books listing & detail
    └── health.ts            # Zod schemas for health check
```

## API Endpoints

### GET /health
Health check endpoint.
```json
{
  "status": "ok",
  "browser": "connected"
}
```

### GET /api/genres
Returns all book genres/categories from the sidebar.
```json
{
  "genres": [
    { "name": "Travel", "slug": "travel_2" },
    { "name": "Mystery", "slug": "mystery_3" },
    ...
  ]
}
```

### GET /api/books
Returns a paginated list of books.

**Query parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `genre` | string | — | Genre slug to filter by |
| `page` | number | `1` | Page number |

```json
{
  "currentPage": 1,
  "totalPages": 50,
  "recordsPerPage": 20,
  "totalRecords": 1000,
  "books": [
    {
      "thumbnailUrl": "https://...",
      "name": "A Light in the Attic",
      "slug": "a-light-in-the-attic_1000",
      "price": "£51.77",
      "inStock": true,
      "rating": 3
    }
  ]
}
```

Pages beyond the available range return `totalPages: 0`, `totalRecords: 0`, and an empty `books` array.

### GET /api/books/:slug
Returns comprehensive details for a single book.

```json
{
  "imageUrl": "https://...",
  "name": "A Light in the Attic",
  "price": "£51.77",
  "available": 22,
  "rating": 3,
  "description": "It's hard to imagine a world without...",
  "upc": "a897fe39b1053632",
  "productType": "Books",
  "priceWithTax": "£51.77",
  "priceWithoutTax": "£51.77",
  "tax": "£0.00",
  "numReviews": 0
}
```

Returns `404` with `{ "error": "Book not found" }` for invalid slugs.

## Documentation

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/docs/openapi.json`

## Commands

```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run compiled server
pnpm typecheck    # Type-check without emit
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm format:check # Check formatting without writing
```

## Browser Lifecycle (Critical)

The app launches **one global Chromium instance** on startup (`initBrowser()`). For each request:
1. Creates new page/context via `browser.createPage()`
2. Performs scraping
3. **Always closes page/context in `finally` block** via `browser.closePage()`

This prevents memory leaks and high server overhead from repeated browser launches.

## Pre-commit Hooks

On every commit, `husky` runs `lint-staged` which:
1. Runs `eslint --fix` — enforces correct formatting, no unused imports, consistent type imports
2. Runs `prettier --write` — auto-formats code

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |

## Architecture Notes

- **Fastify decorators** used for browser utilities (`scrapePage`, `browser.createPage`, etc.)
- **Module augmentation** (`declare module 'fastify'`) for TypeScript support on decorated methods
- **Zod schemas** converted to JSON Schema via `zod-to-json-schema` for Swagger compatibility
- **ES Modules** (`"type": "module"` in package.json) — use `.js` extensions in imports
