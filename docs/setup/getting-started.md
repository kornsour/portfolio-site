# Getting started

From a fresh clone to the site running locally in under a minute.

## Prerequisites

- Node ≥ 24 and pnpm (`corepack enable` so the pinned pnpm is used —
  [ADR-0002](../adr/0002-package-manager-pnpm-pinned.md))

That's it — no database, no env vars, no external services.

## Run

```bash
pnpm install
pnpm dev        # → http://localhost:3000
```

## Edit content

All page content lives in `src/content/portfolio.ts`. The resume PDF lives at
`public/resume.pdf`. See the [README](../../README.md#edit-content).

## Everyday commands

```bash
pnpm dev            # dev server (Turbopack)
pnpm check:fix      # lint + format (Biome)
pnpm test           # unit tests (Vitest)
pnpm e2e            # Playwright smoke test (local, needs Chromium: pnpm exec playwright install chromium)
pnpm build          # production build — every route is static
```

## Deploy

See [deployment.md](./deployment.md).
