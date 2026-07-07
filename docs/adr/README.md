# Architecture Decision Records

An ADR captures a single architectural decision: its context, the choice made,
and the consequences. They give future maintainers (human or AI) the _why_, so
decisions aren't silently undone.

## Format

Each record uses a short [MADR](https://adr.github.io/madr/)-style template:

```
# ADR-NNNN: Title

- Status: Proposed | Accepted | Superseded by ADR-XXXX
- Date: YYYY-MM-DD

## Context
## Decision
## Consequences
```

## Process

1. Copy the format above into `NNNN-short-title.md` (next number).
2. Open it as `Proposed` in a PR; mark `Accepted` when merged.
3. Never edit an `Accepted` ADR's decision — supersede it with a new ADR.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](./0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](./0002-package-manager-pnpm-pinned.md) | Pin the package manager (pnpm 10.x via `packageManager`) | Accepted |
| [0003](./0003-node-version-pinning.md) | Pin Node.js 24 LTS via `.nvmrc` and `engines` | Accepted |
| [0004](./0004-biome-for-lint-and-format.md) | Use Biome for linting and formatting | Accepted |
| 0005 | Use Drizzle ORM with Neon serverless Postgres | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| [0006](./0006-type-safe-env.md) | Validate environment variables at the boundary | Accepted |
| 0007 | Use next-safe-action for Server Actions | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| [0008](./0008-e2e-local-only.md) | Run Playwright E2E locally, not in CI | Accepted |
| [0009](./0009-security-headers.md) | Set baseline HTTP security headers | Accepted |
| [0010](./0010-unit-testing-vitest.md) | Unit test with Vitest in a Node environment | Accepted |
| 0011 | Local Postgres in dev, Neon in prod (dual driver) | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| 0012 | Authentication with better-auth (self-hosted) | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| 0013 | Stripe subscription billing, feature-flagged by env | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| [0014](./0014-content-security-policy.md) | Add a nonce-based Content-Security-Policy in middleware | Superseded by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| 0015 | Legal-disclosure page scaffolding (ToS, Privacy, AUP, AI Disclosure, Cookies) | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| 0016 | Automated migration deploy, CI validation, and optional Neon preview branches | Removed by [ADR-0017](./0017-static-portfolio-strip-down.md) |
| [0017](./0017-static-portfolio-strip-down.md) | Strip the template to a static portfolio site | Accepted |
