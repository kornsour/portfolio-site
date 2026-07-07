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

## Project Structure

```
src/
├── content/portfolio.ts   # ALL content + its test
├── env.ts                 # NEXT_PUBLIC_APP_URL (defaults to https://andrewkaiserauer.com)
├── app/
│   ├── layout.tsx         # fonts, metadata, theme-init inline script
│   ├── page.tsx           # composes sections; JSON-LD Person
│   ├── globals.css        # design tokens, class-based dark mode, reveal animation
│   └── opengraph-image.tsx / icon.tsx / sitemap.ts / robots.ts
└── components/            # site-header, hero, about, experience, projects,
                           # skills, contact, site-footer, theme-toggle,
                           # section, reveal, icons
public/resume.pdf          # replace the placeholder with the real resume
```

## Design language (keep it)

"Modern Neutral": zinc surfaces, **indigo** as the only accent (used
sparingly), 8px radius (`rounded-lg`), soft shadows, generous whitespace,
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
don't edit). Deployment (Vercel + Cloudflare DNS for andrewkaiserauer.com):
`docs/setup/deployment.md`.
