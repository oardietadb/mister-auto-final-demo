# Event and demo-service architecture

## Browser event flow

`src/lib/analytics.ts` defines the extensible `AnalyticsEvent` union and keeps the existing `storefront:analytics` browser event for local integrations. It also posts events to `POST /api/events`. The initial registry contains only:

- `pageView`
- `productListView`
- `productView`
- `search`

The route validates each payload against that registry, rejects unexpected shapes, bounds text and array sizes, and masks detected email addresses and phone numbers before storage or delivery. Registration passwords and newsletter addresses are not analytics fields and are never forwarded to the event adapter.

## Temporary event repository

`src/lib/server/demo-repositories.ts` is a process-local in-memory repository with a 300-event limit. `GET /api/demo/events` and the `/demo/events` inspector expose the sanitized records for local demonstration; `DELETE /api/demo/events` clears them. This is not durable storage: process restarts, multiple instances, and serverless deployments can lose or split records. Do not use it for production data.

The outbound adapter in `src/lib/server/event-adapter.ts` is disabled by default. To exercise a trusted development receiver, set `MISTER_AUTO_EVENT_ADAPTER_ENABLED=true` and `MISTER_AUTO_EVENT_ADAPTER_URL` in the server environment. Missing or invalid configuration is reported as `not-configured`; failed delivery is not represented as success. No Adobe SDK, Adobe endpoint, or Adobe integration is included.

## Other demo endpoints

- `POST /api/newsletter` requires a valid email and explicit consent. It deduplicates subscribers in the same temporary process store; subscriber addresses are not exposed through the event inspector or included in event payloads.
- `POST /api/auth/register` validates the separate B2C/B2B form fields and returns a public demo profile. It does not persist credentials or create a real authenticated account. The browser stores only the public profile.
- `POST /api/vehicles` validates the local demonstration make/model/engine selection. The selected garage remains in browser storage through `src/lib/persistence.ts`; the endpoint does not perform a real registration lookup.

These endpoints are demonstration scaffolding, not production authentication, mailing-list, vehicle-compatibility, or event infrastructure. Replace the process-local repositories and demo adapters with appropriately secured, consent-aware services before deployment.
