# OmarPhone

Premium repair website built with Angular.

## Development

Run the Angular site only:

```bash
npm start -- --port 4300
```

Run the backend API only:

```bash
npm run api
```

Run both the Angular site and backend API:

```bash
npm run dev
```

The website runs at `http://127.0.0.1:4300/`.
The booking API runs at `http://127.0.0.1:4301/api`.

Admin login is validated by the backend. Set these environment variables before running the API:

```bash
OMARPHONE_ADMIN_USERNAME=admin
OMARPHONE_ADMIN_PASSWORD=your-secure-password
OMARPHONE_ADMIN_AUTH_SECRET=your-long-random-token-secret
```

## Booking API

Confirmed bookings are posted to `POST /api/orders` and saved in `server/data/orders.json`.
The admin dashboard at `/admin` reads from `GET /api/orders`.

If the API is offline, the website falls back to local browser storage.

## Database

Blog posts are stored in real database tables: `blog_posts` and `blog_post_tags`.
For a fresh Neon/Postgres database, run `sql/setup-postgres.sql`.
For an existing Neon database that still has blog content inside `content_sections.payload_json`, run `sql/migrate-blog-posts.sql` once in the Neon SQL Editor.
To delete all OmarPhone tables, recreate the schema, and insert fresh seed data, run `sql/reset-database-with-data.sql`.

The old JSON `content_sections` payloads have been split into real tables too. Run `sql/migrate-content-sections.sql` once in the Neon SQL Editor to create and backfill:

`home_services`, `home_testimonials`, `booking_devices`, `booking_repair_issues`, `review_stats`, `customer_reviews`, `before_after_repairs`, `before_after_testimonials`, `service_hero_trust`, `service_cards`, `service_trust_features`, `service_process_steps`, `support_faqs`, `support_quick_actions`, and `support_contact_info`.

`content_sections` is now kept only for admin compatibility and section metadata.

Blog CRUD uses the real blog tables:

- `GET /api/blog-posts`
- `POST /api/blog-posts`
- `GET /api/blog-posts/:slug`
- `PUT /api/blog-posts/:slug`
- `PATCH /api/blog-posts/:slug`
- `DELETE /api/blog-posts/:slug`

Separated content CRUD uses named resources backed by real content tables:

- `GET /api/home-services`
- `GET /api/home-testimonials`
- `GET /api/booking-devices`
- `GET /api/repair-issues`
- `GET /api/review-stats`
- `GET /api/reviews`
- `GET /api/before-after-repairs`
- `GET /api/before-after-testimonials`
- `GET /api/service-trust`
- `GET /api/services`
- `GET /api/service-features`
- `GET /api/service-process`
- `GET /api/support-faqs`
- `GET /api/support-actions`
- `GET /api/support-contact`

Every resource supports the same admin CRUD pattern:

- `GET /api/:resource`
- `POST /api/:resource`
- `PUT /api/:resource/:id`
- `PATCH /api/:resource/:id`
- `DELETE /api/:resource/:id`

The lower-level `/api/content-tables` routes still exist for compatibility, but new CRUD should use the named resource routes above.

Media uploads are stored in the database table `media_assets`.

- `POST /api/media` uploads an image with admin auth.
- `GET /api/media/:id` serves the image to the frontend.
- `DELETE /api/media/:id` removes an uploaded image with admin auth.

The admin content editor can upload an image beside any image field. The upload returns a URL like `/api/media/<id>`, and that URL can be saved in `image`, `avatar`, `beforeImage`, or `afterImage` fields instead of using `/assets/...` or `/images/...`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
