# ADR-0017: Strip the template to a static portfolio site

- Status: Accepted
- Date: 2026-07-06

## Context

This repo started from `typescript-template`, which ships authentication
(better-auth), a database layer (Drizzle + local Postgres/Neon), Stripe
billing, SES email, and legal-disclosure pages. The app being built is a
personal portfolio: a single static, content-driven page with no accounts, no
payments, no stored data, and a `mailto:` contact link instead of a form.

## Decision

Remove — not stub — every server-side subsystem the portfolio does not use:

- **Auth** (ADR-0012), **database** (ADR-0005, ADR-0011, ADR-0016), and
  **billing** (ADR-0013): routes, libs, schema, migrations, scripts, CI jobs,
  and dependencies deleted.
- **Server actions** (ADR-0007) and the SES email lib: deleted along with the
  contact form idea — contact is a `mailto:` link.
- **Legal pages** (ADR-0015) and the cookie banner: no accounts, no billing,
  and no cookies (the theme preference uses `localStorage`), so none are
  required.
- **Nonce-based CSP in middleware** (ADR-0014): superseded. Nonces require
  per-request rendering; this site is 100% statically generated. The CSP is
  now a static header in `next.config.ts` with `'unsafe-inline'` for scripts —
  an accepted trade-off for a site holding no sessions or user data.

Retained: Biome (ADR-0004), type-safe env (ADR-0006, reduced to
`NEXT_PUBLIC_APP_URL`), local-only E2E (ADR-0008), baseline security headers
(ADR-0009), Vitest (ADR-0010), and the pnpm/Node pinning (ADR-0002/0003).

All site content lives in one typed module, `src/content/portfolio.ts`,
validated by unit tests.

## Consequences

- Every route is statically generated; the site needs no env vars or services
  to build, run, or deploy.
- The removed subsystems' ADRs (0005, 0007, 0011–0013, 0015, 0016) and their
  docs were deleted with the code; this ADR records where they went. They
  remain in git history and in the upstream template.
- Re-adding a server-side feature later means pulling it back from the
  template, not un-stubbing something here.
