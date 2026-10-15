# Event and demo-service architecture

## Browser event flow

`src/lib/analytics.ts` defines the extensible `AnalyticsEvent` union and keeps the existing `storefront:analytics` browser event for local integrations. When both public Supabase environment variables are set, it also posts events to `POST /api/events`. Without either variable, it skips the network request entirely while preserving the browser event. The registry includes:

- `pageView`
- `productListView`
- `productView`
- `search`
- `accountRegistration` (account type and marketing-consent choice only)
- `newsletterSubscribe` (no e-mail address)

The route validates each payload against that registry, rejects unexpected shapes, bounds text and array sizes, and masks detected email addresses and phone numbers before storage or delivery. Registration passwords and newsletter addresses are not analytics fields and are never forwarded to the event adapter.

## Persistent and preview event storage

`POST /api/events` validates and writes sanitized payloads to the `storefront_events` Supabase table. Row-level security permits inserts only; no public read access is granted. The SQL constraints restrict event types and payload shape and reject e-mail addresses. `GET /api/demo/events` and the `/demo/events` inspector are still a process-local preview cache with a 300-event limit; they are not the durable event store and may be empty across serverless instances.

The outbound adapter in `src/lib/server/event-adapter.ts` is disabled by default. To exercise a trusted development receiver, set `MISTER_AUTO_EVENT_ADAPTER_ENABLED=true` and `MISTER_AUTO_EVENT_ADAPTER_URL` in the server environment. Missing or invalid configuration is reported as `not-configured`; failed delivery is not represented as success. No Adobe SDK or endpoint is included.

Adobe Tags can observe the storefront through direct calls in `src/lib/track.ts`; the helper only invokes `window._satellite.track(id)` and sends no event data. Calls use `ma_pageView`, `ma_productView`, `ma_addToCart`, `ma_cartView`, `ma_checkout`, `ma_vehicleAdded`, `ma_login`, `ma_registration`, `ma_newsletter`, and `ma_search`. Product metadata is exposed on `#ma-product`; the cart is synchronized to `window.misterAuto.cart`; submitted search text is set on `window.misterAuto.searchKeyword`. This does not bundle the Adobe SDK or configure Adobe Tags.

## Form and account persistence

- `POST /api/newsletter` requires a valid e-mail and explicit consent. Supabase stores the e-mail and consent timestamp in `newsletter_subscriptions`; duplicate e-mails are handled without exposing stored addresses. A mailing provider and confirmation message are not configured.
- `POST /api/auth/register` validates B2C/B2B fields and creates a Supabase Auth account. The SQL trigger stores the customer profile and consent in `customer_profiles`; passwords are handled only by Supabase Auth.
- `POST /api/auth/login`, `GET /api/auth/session`, and `POST /api/auth/logout` manage Supabase sessions in HTTP-only cookies. `GET /auth/callback` exchanges the e-mail confirmation code for a session. Public profile details are loaded from Supabase and are not treated as an authentication token in browser storage.
- `POST /api/vehicles` validates the local demonstration make/model/engine selection, mileage band, optional inspection month and year, and optional registration. The selected garage remains in browser storage through `src/lib/persistence.ts`; the endpoint does not perform a real registration lookup or write vehicle records to Supabase.

The server-side forms and event endpoints require the two public Supabase environment variables and the SQL migration in `supabase/migrations/`. Their missing configuration is returned as a service error; requests are not silently stored in memory as a fallback. The browser avoids calling `/api/auth/*` and `/api/events` when either variable is missing. In that local demo mode, B2C/B2B login and registration save only the non-password profile to `mister-auto-demo-user`; session restore reads that key, and logout removes it. No Adobe SDK or Adobe endpoint is included.
