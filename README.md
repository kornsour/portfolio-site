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

Career FACTS — employment dates, job titles, role bullets, skills,
certifications, education — live one level down in
[`src/content/career.ts`](./src/content/career.ts), because the resume states
them too. `portfolio.ts` derives the site from that record and
`scripts/generate-resume.mts` renders the PDF from it, so each fact is written
exactly once.

- **Resume:** never hand-edit the PDF. Edit `src/content/career.ts`, then:

  ```bash
  pnpm resume          # both cuts
  pnpm resume:check    # fail if the committed public/resume.pdf is stale
  pnpm resume:text     # print the text an ATS would extract
  ```

  `public/resume.pdf` is the **leadership cut** and the only one the site
  offers. The **IC / AI-infrastructure cut** is written to `resumes/`
  (gitignored, outside `public/`) and is attached to applications by hand — this
  is a static export, so anything under `public/` is served at a guessable URL
  whether or not a link points at it.
- **Canonical domain:** defaults to `https://andrewkaiserauer.com` in
  [`src/env.ts`](./src/env.ts); override with `NEXT_PUBLIC_APP_URL` for
  previews.
- Content changes are guarded by unit tests
  ([`src/content/portfolio.test.ts`](./src/content/portfolio.test.ts),
  [`src/content/career.test.ts`](./src/content/career.test.ts),
  [`src/lib/resume/resume-pdf.test.ts`](./src/lib/resume/resume-pdf.test.ts)) —
  no phone number ever ships on the site, every project keeps a repo link, and
  the committed PDF must be byte-identical to what the data generates.

## Checks

```bash
pnpm check:fix    # Biome lint + format
pnpm test         # Vitest (content-integrity tests)
pnpm resume       # regenerate the resume PDFs from src/content/career.ts
pnpm e2e          # Playwright smoke test (local only; set E2E_PORT if 3000 is busy)
pnpm build        # portable static export → out/
```

## Deploy

Every build is a portable static export (`out/`). Production is a Cloudflare
Worker (`infra/cloudflare`) that serves that export from the edge and applies
the security headers, in front of `andrewkaiserauer.com`:

```bash
pnpm build
cd infra/cloudflare && npx wrangler deploy
```

An AWS-native profile — a private S3 origin behind CloudFront, no Lambda
runtime — lives in `infra/aws` and is dispatched via the **AWS static deploy**
GitHub Actions workflow once AWS account verification for CloudFront clears;
until then it isn't deployable. No env vars are required for either target;
set `NEXT_PUBLIC_APP_URL` only if the domain changes.

See [`docs/setup/deployment.md`](./docs/setup/deployment.md) and
[ADR-0018](./docs/adr/0018-portable-static-export.md) for the full picture,
including why Cloudflare is standing in for CloudFront.
