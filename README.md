# E-Commerce Product Catalog

Node.js + Express + MongoDB API with a React (Vite) frontend.

## Run
```bash
# 1. MongoDB must be running locally (or set MONGO_URI to Atlas)
cd backend && cp .env.example .env && npm install && npm run seed && npm run dev
# 2. In another terminal
cd frontend && npm install && npm run dev      # http://localhost:5173
```

## API (base `/api/v1`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/products` | List with search, filters, sort, pagination |
| GET | `/products/brands` | Distinct brands for the filter list |
| GET | `/products/:id` | One product |
| POST | `/products` | Create (validated) |
| PUT | `/products/:id` | Partial update |
| DELETE | `/products/:id` | Delete (204) |
| GET | `/categories` | Category tree |
| POST | `/categories` | Create (optional `parent` id) |

`GET /products` query params: `q`, `category` (slug, includes subcategories), `brand` (comma list), `minPrice`, `maxPrice`, `inStock`, `minRating`, `sort` (`relevance|price_asc|price_desc|rating|newest`), `page`, `limit` (max 50).

Response: `{ success, data: [...], pagination: { page, limit, total, pages } }`

## Design notes
- **Layers:** routes, validators/middleware, controllers (HTTP only), services (business logic), models.
- **Category modeling:** self-referencing `parent` gives an unlimited-depth tree; filtering by a parent slug expands to all descendants. Category-specific fields live in `attributes` (a Map).
- **Indexing:** weighted text index (search), compound indexes `category+price`, `brand+price`, `rating+createdAt` to cover filter + sort combos.
- **Pagination:** server-side `skip/limit` with a parallel `countDocuments`. For very deep paging, switch to cursor pagination.
- **Validation and sanitization:** Joi on body, query and params (unknown keys stripped, types coerced, trimmed), `express-mongo-sanitize` against NoSQL operator injection, Helmet, rate limiting, 50kb body cap.
- **Errors:** one handler returns consistent `{ success:false, message, details }` with correct status codes (400/404/409/422).
