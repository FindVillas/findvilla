# Welcome to our lovely project!

<img src="https://raw.githubusercontent.com/FindVillas/findvilla/refs/heads/main/logo.jpg" width="500">

Free villas for everybody, villa for you, villa for me, villa for dog, villa for frog! Long live **potatoconsumer**. Now buckle up -- boring information below 🙄

# FindVillas

A bilingual Thailand villa marketplace built with Next.js 16, Supabase/Postgres, Google Auth, private Supabase Storage, Mapbox, Omise test payments, and transactional email.

The application no longer uses runtime fixtures or `localStorage`. Catalog, users, role grants, listings, media, booking requests, holds, payment attempts, confirmed bookings, notifications, email outbox, and audit events all live in Supabase.

## Local development

Requirements: Node.js, npm, Docker, and the Supabase CLI package installed by `npm install`.

```bash
npm install
npm run dev:services
npm run dev
```

This workspace's ignored `.env.local` is already configured for the local stack. On another machine, run `npx supabase status -o env` after startup and copy its API URL, anon key, service-role key, and database URL into `.env.local` using `.env.example` as the template.

Local services:

- App: `http://localhost:3000/en`
- Supabase Studio: `http://127.0.0.1:54323`
- Mailpit inbox: `http://127.0.0.1:54324`
- Supabase API: `http://127.0.0.1:54321`
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

The login screen exposes local-only Guest, Partner, and Staff buttons. The server creates disposable users through the Supabase Admin API; the seeded email grants assign their roles and the partner membership. This route is disabled outside a non-production localhost Supabase configuration.

Useful authenticated routes:

- `/en/trips` — guest requests, checkout, and confirmed bookings
- `/en/partner/apply` — guest-owned operator application and private evidence upload
- `/en/partner` — additive partner portal for requests and each villa's compliance status
- `/en/admin` — staff operator and property-evidence review queues

Reset to the canonical seed at any time:

```bash
npm run db:reset
```

## Google OAuth locally

Automated local personas cover every authorization path without an external identity provider. Real local Google OAuth additionally needs a Google OAuth client ID and secret; hosted Supabase's saved secret cannot be read back and reused automatically.

1. Create or reuse a Google Web OAuth client.
2. Expose local Supabase port `54321` through an HTTPS tunnel.
3. Add `https://<supabase-tunnel>/auth/v1/callback` to Google's authorized redirect URIs.
4. In `supabase/config.toml`, enable `[auth.external.google]`, set `client_id` and `secret` through environment references, and change `redirect_uri`/Auth external URL to the tunnel URL.
5. Add the app's HTTPS tunnel URL to `auth.additional_redirect_urls`, then restart Supabase.

The application callback is `/auth/callback`; Supabase exchanges Google's code and returns the user there.

## Payments and webhooks

`OMISE_PUBLIC_KEY` and `OMISE_SECRET_KEY` must remain test keys in local development. Card data is tokenized directly by Omise.js. The server creates a test charge, records an idempotent payment attempt, and confirms the hold/booking through a service-role RPC. PromptPay produces a real Omise test QR. The currently configured merchant test account limits a single charge to ฿150,000, and the API reports that limit before calling Omise.

For asynchronous PromptPay testing, expose port `3000` over HTTPS and configure Omise's test webhook as:

```text
https://<app-tunnel>/api/webhooks/omise
```

The webhook never trusts the submitted event payload alone; it retrieves the canonical charge from Omise before changing database state.

## Partner and villa verification

Partner access is additive: an approved partner keeps the guest account and My Trips. Operator approval and villa publication are separate gates.

- Individuals and Thai legal entities can apply as owners/operators or authorized managers/agents.
- The server derives conditional operator evidence from entity type, authority, VAT status, and foreign involvement.
- Every villa selects either a hotel-licence path or the small non-hotel notification path. The latter is constrained to no more than 8 rooms and 30 guests.
- Property rights, plans, current photographs, fire safety, legal-path evidence, and guest liability insurance must all be verified before publication.
- Evidence lives in the private `partner-evidence` bucket. Staff previews use five-minute signed URLs and record the reviewer, purpose, and access time.
- A case has one assigned reviewer. Verification events and evidence-access events are append-only.
- Rejected or withdrawn application evidence is purged after 90 days. Expired mandatory evidence suspends the villa through the scheduled job.

The checklist is operational due diligence, not a substitute for advice from Thai counsel or a licensing decision by the responsible authority.

## Email and scheduled work

Local email uses SMTP on port `54325` and appears in Mailpit. Resend is not required locally. Run the expiration/outbox job with:

```bash
curl -H "Authorization: Bearer local-development-cron-secret" \
  http://localhost:3000/api/cron/expire-holds
```

Production should set a strong `CRON_SECRET`, set `EMAIL_TRANSPORT=resend`, and provide `RESEND_API_KEY` plus a verified sender.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run db:test
npm run test:e2e
npm run build
```

The database suite validates the canonical migration/seeds, compliance RPCs, append-only verification audit, and core RLS configuration. The browser suite uses system Chromium and verifies the database-backed catalog, distinct guest/partner-application routing, and the partner request-detail action.

## Moving to hosted Supabase later

The hosted project has not been mutated by this local workflow. When local acceptance is complete:

1. Back up and inspect the target project.
2. Link the CLI to that exact project.
3. Review the baseline migration and seed strategy; local persona grants should not be applied to production.
4. Run a dry-run/diff, then apply migrations in a controlled deployment.
5. Configure hosted Google redirect URLs, the `villa-media` bucket, the private `partner-evidence` bucket, Omise webhook, Resend, cron, and production secrets.

Never copy the local Supabase JWT/service-role values into production.
