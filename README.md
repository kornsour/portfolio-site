# andrewkaiserauer.com

Personal portfolio for Andrew Kaiserauer — a single-page, fully static site
built with Next.js (App Router), TypeScript, and Tailwind CSS v4. Derived from
[`typescript-template`](https://github.com/kornsour) with the auth, database,
and billing layers removed (see [ADR-0017](./docs/adr/0017-static-portfolio-strip-down.md)).

## Run it locally

```bash
pnpm install
pnpm dev        # → http://localhost:3000
```

No database, no env vars, no services required. (`corepack enable` once so the
pinned pnpm is used.)

## Edit content

Everything on the page — bio, experience, projects, skills, links — lives in
one typed file: [`src/content/portfolio.ts`](./src/content/portfolio.ts).
Components render whatever is there; you should never need to touch them for a
content change.

- **Resume:** drop the PDF at [`public/resume.pdf`](./public/resume.pdf)
  (a placeholder ships in the repo — replace it).
- **Canonical domain:** defaults to `https://andrewkaiserauer.com` in
  [`src/env.ts`](./src/env.ts); override with `NEXT_PUBLIC_APP_URL` for
  previews.
- Content changes are guarded by unit tests
  ([`src/content/portfolio.test.ts`](./src/content/portfolio.test.ts)) — e.g.
  no phone number ever ships, every project keeps a repo link.

## Checks

```bash
pnpm check:fix    # Biome lint + format
pnpm test         # Vitest (content-integrity tests)
pnpm e2e          # Playwright smoke test (local only)
pnpm build        # production build — all routes static
```

## Deploy to Vercel

```bash
vercel link
vercel deploy --prod
```

Then point the domain at it (Cloudflare DNS, kept **DNS-only** until the
certificate is issued):

```bash
vercel domains add andrewkaiserauer.com <project>   # prints the required record
cf dns records create -z andrewkaiserauer.com --body '{"type":"A","name":"@","content":"76.76.21.21","ttl":1,"proxied":false}'
vercel domains inspect andrewkaiserauer.com          # poll until valid
```

Use whatever record/target `vercel domains add` actually prints. No env vars
are needed in Vercel; set `NEXT_PUBLIC_APP_URL` only if the domain changes.
