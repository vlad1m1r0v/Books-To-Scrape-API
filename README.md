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
| Dev Tools | tsx (TypeScript execution), TypeScript, ESLint |

## Folder Structure

```
src/
├── index.ts           # Server entry point, browser lifecycle, plugin registration
├── config.ts          # Constants (BASE_URL)
├── routes/
│   └── genres.ts      # GET /api/genres endpoint
├── services/
│   └── scraper.ts     # Playwright scraping logic (scrapeGenres)
└── schemas/
    └── genres.ts      # Zod schemas for genres (optional future use)
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

## Documentation

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/docs/openapi.json`

## Commands

```bash
pnpm dev      # Start dev server with hot reload
pnpm build    # Compile TypeScript to dist/
pnpm start    # Run compiled server
pnpm typecheck # Type-check without emit
```

## Browser Lifecycle (Critical)

The app launches **one global Chromium instance** on startup (`initBrowser()`). For each request:
1. Creates new page/context via `browser.createPage()`
2. Performs scraping
3. **Always closes page/context in `finally` block** via `browser.closePage()`

This prevents memory leaks and high server overhead from repeated browser launches.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |

## Future Endpoints (Planned)

- `GET /api/books` - List books with query params: `genre`, `page`
- `GET /api/books/:slug` - Full book detail (UPC, description, stock, etc.)

## Architecture Notes

- **Fastify decorators** used for browser utilities (`scrapePage`, `browser.createPage`, etc.)
- **Module augmentation** (`declare module 'fastify'`) for TypeScript support on decorated methods
- **Zod schemas** converted to JSON Schema via `zod-to-json-schema` for Swagger compatibility
- **ES Modules** (`"type": "module"` in package.json) - use `.js` extensions in imports
