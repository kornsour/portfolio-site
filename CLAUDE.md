# CLAUDE.md

## Project Overview

Andrew Kaiserauer's personal portfolio — a **single-page, fully static** site
(Next.js App Router + TypeScript + Tailwind v4). Derived from
`typescript-template` with auth, Drizzle/Postgres, Stripe, SES email, server
actions, and the legal pages **removed** (see
[ADR-0017](./docs/adr/0017-static-portfolio-strip-down.md)). Do not reintroduce
a database, auth, a CMS, or a second styling system.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack) · **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 · **Lint/format**: Biome (not ESLint/Prettier)
- **Unit**: Vitest · **E2E**: Playwright (local only, [ADR-0008](./docs/adr/0008-e2e-local-only.md))
- **Env**: `@t3-oss/env-nextjs` + Zod (single var: `NEXT_PUBLIC_APP_URL`) · **PM**: pnpm

## The one rule that matters

**All page content lives in `src/content/portfolio.ts`.** Bio, roles,
projects, skills, nav, links — everything. Components only render what's
there. A content change must never require touching a component; if it does,
fix the component. Content invariants (no phone number, repo links present,
job title not inflated) are enforced by `src/content/portfolio.test.ts`.

**One fact, one place — `src/content/career.ts`.** Anything the RESUME also
states — employment dates, job titles, role bullets, the org size, skills,
certifications, education — is written there once. `portfolio.ts` derives the
site from it (`person.title`, `roles`, periods, `about`'s numbers) and
`scripts/generate-resume.mts` renders `public/resume.pdf` from it. This exists
because the two used to be independent hand-maintained copies of one career and
they drifted: the site said the GE years began in 2015, the resume said Jul
2016, and a comment in `portfolio.ts` asserted a Deloitte HR title that was
simply wrong. Site PROSE (headline, value prop, about paragraphs, project
descriptions) still belongs in `portfolio.ts`.

**Never invent, embellish, or infer a biographical fact.** If a fact is needed
and is not in `career.ts`, ask Andrew — do not fill the gap. Every claim has to
survive a background check and a deep-dive interview question. Two consequences
are already encoded: an expired certification carries its expiry (an undated one
reads as current), and `independentEngineering` is personal work that must never
be presented as professional experience — no employer, no dates, its own
heading, always below the employment history, in every variant.

## The resume

```bash
pnpm resume          # regenerate both cuts from src/content/career.ts
pnpm resume:ic       # the IC cut only
pnpm resume:check    # fail if the committed public/resume.pdf is stale
pnpm resume:text     # print the text layer an ATS would extract
```

Never hand-edit `public/resume.pdf` — a unit test fails the moment the committed
file stops being byte-identical to what the data generates. That test is the
whole anti-drift mechanism, which is why the generator is deterministic (no
`/CreationDate`, no ids, no clock).

- **Generator: hand-rolled, zero dependencies** (`src/lib/resume/`). Headless
  Chrome was rejected — a browser download in CI to typeset ~55 lines, and it
  re-encodes fonts on the way out, which is the exact thing an ATS-parseable
  resume must not do. `pdfkit` / `@react-pdf/renderer` were rejected as a font
  engine plus a dozen transitive packages for the same job. It runs on Node 24's
  built-in TypeScript stripping — hence the explicit `.ts` import specifiers in
  `src/lib/resume/` and `allowImportingTsExtensions` in `tsconfig.json`.
- **ATS-parseable means base-14 fonts, `WinAnsiEncoding`, nothing embedded,
  nothing subsetted, single column, boring section headings, text in reading
  order.** A character WinAnsi cannot represent is a hard error, not a silent
  `?` — that is why an arrow became "to" while `×` and `²` were checked against
  the encoding table and kept.
- **The font width tables are calibrated, not guessed** — read the header of
  `font-metrics.ts`. They reproduce two spans poppler independently measured out
  of the previous resume, landing on exactly 9pt and 14pt. Recalibrate before
  trusting any change to them: a wrong table does not fail, it just wraps lines
  in the wrong place.
- **One page is enforced structurally.** `fitResume()` picks the largest body
  size in a narrow band that fits and throws otherwise; when it throws, cut a
  bullet rather than shrinking the type further.
- **Two cuts, one published.** `public/resume.pdf` is the leadership cut and the
  only one the site offers. The IC / AI-infrastructure cut reorders and
  reweights the *same* verified bullets and is written to `resumes/`
  (gitignored, attached to applications by hand). It must never be emitted into
  `public/`: this is a static export, so a file there is served at a guessable
  URL whether or not anything links to it — "unlinked" is not "unpublished",
  and a test enforces it.

## Project Structure

```
src/
├── content/career.ts      # CANONICAL career record (dates, titles, bullets, certs)
├── content/portfolio.ts   # site content; derives career facts from career.ts
├── lib/resume/            # zero-dependency PDF generator + text extractor
├── env.ts                 # NEXT_PUBLIC_APP_URL (defaults to https://andrewkaiserauer.com)
├── app/
│   ├── layout.tsx         # fonts, metadata, theme-init inline script
│   ├── page.tsx           # composes sections; JSON-LD Person
│   ├── globals.css        # design tokens, class-based dark mode, reveal animation
│   └── opengraph-image.tsx / icon.tsx / sitemap.ts / robots.ts
└── components/            # site-header, hero, about, experience, projects,
                           # skills, contact, site-footer, theme-toggle,
                           # section, reveal, icons
scripts/generate-resume.mts  # `pnpm resume`
public/resume.pdf          # GENERATED — do not hand-edit
resumes/                   # GENERATED, gitignored — cuts the site does not offer
```

## Design language (keep it)

"Modern Neutral": zinc surfaces, **Spartan green** as the only accent (the
custom `spartan-*` palette in `globals.css`, anchored on Michigan State green
#18453B; used sparingly), 8px radius (`rounded-lg`), soft shadows, generous whitespace,
Geist type. Light + dark mode via a `.dark` class on `<html>` set before paint
by the inline script in `layout.tsx`; the `dark:` variant is class-based
(`@custom-variant` in `globals.css`). Motion is subtle only — the `Reveal`
component respects `prefers-reduced-motion` and must keep content visible
without JS. No animation libraries, no parallax.

## Quality bar

- Every route stays statically generated (`pnpm build` must show all `○`).
- WCAG AA in both themes; keyboard navigable; visible focus states.
- No phone number anywhere on the site — a unit test enforces this.
- Content claims come from the user only. **Never invent metrics, employers,
  titles, or credentials.** The job title is "Manager, Platform Engineering" —
  do not inflate it.

## Common Commands

```bash
pnpm dev              # dev server (Turbopack)
pnpm build            # production build (all static, no env needed)
pnpm check[:fix]      # Biome lint+format
pnpm test             # unit tests (Vitest)
pnpm resume           # regenerate the resume PDFs from src/content/career.ts
pnpm e2e[:ui]         # E2E (Playwright, local)
```

## Code Style

- Biome only; tabs; line width 100; double quotes; semicolons. Run `pnpm check:fix` before committing.
- A commit is gated by a PreToolUse hook that runs `pnpm check && pnpm test`
  (`.claude/settings.json` → `scripts/hooks/pre-commit-gate.sh`).

## Security

- See `docs/security.md`. Static CSP + baseline headers in `next.config.ts`
  (the template's nonce CSP/proxy is gone — nonces don't work on static pages).
- The only `dangerouslySetInnerHTML` uses are the static theme-init snippet
  and JSON-LD; don't add ones that touch non-literal input.

## Decisions & Docs

ADRs in `docs/adr/` (read before changing foundational tooling; supersede,
don't edit). Deployment (Cloudflare Worker, AWS S3/CloudFront pending account
verification) for andrewkaiserauer.com: `docs/setup/deployment.md`.
`docs/archive/` holds superseded/historical docs and records only — never
treat its contents as current or use them to inform new work.
