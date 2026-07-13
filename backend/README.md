# OmarPhone Backend Structure

The Vercel API uses a single entrypoint:

- `api/[...path].mjs`

That entrypoint delegates to the backend router:

- `backend/router/api-router.mjs`

The router calls controllers, and controllers call services:

- `backend/controllers/` - HTTP request/response behavior, status codes, auth guards
- `backend/services/` - domain operations for admin auth, content, blogs, orders, media, health
- `backend/http/` - request parsing helpers
- `api/_store.mjs` - PostgreSQL repository and schema/bootstrap functions

The dashboard should call separated CRUD APIs such as:

- `GET/POST /api/services`
- `PUT/PATCH/DELETE /api/services/:id`
- `GET/POST /api/reviews`
- `GET/POST /api/support-faqs`
- `GET /api/content-resources`

Protected admin routes require the bearer token returned by:

- `POST /api/admin/login`
