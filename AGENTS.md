# AGENTS.md

This project's agent guidance lives in [`CLAUDE.md`](./CLAUDE.md) — read it first.

Quick pointers for any coding agent (Claude Code, Codex, Cursor, …):

- **This is a fully static portfolio site.** No database, no auth, no server
  actions, no env vars required. Don't reintroduce them
  ([ADR-0017](./docs/adr/0017-static-portfolio-strip-down.md)).
- **Content edits go in `src/content/portfolio.ts`**, never in components.
  Never invent metrics, employers, titles, or credentials; no phone number on
  the site.
- **Career facts go in `src/content/career.ts`** — employment dates, job titles,
  role bullets, skills, certifications, education. The site derives from it and
  `pnpm resume` regenerates `public/resume.pdf` from it. Never hand-edit that
  PDF; a unit test fails the moment it stops matching the data.
- **Setup:** `pnpm install && pnpm dev`.
- **Before committing:** `pnpm check:fix && pnpm test`. A commit hook enforces this.
- **Foundational changes:** read the relevant ADR in `docs/adr/` first; add a
  superseding ADR when you change a decision.
- **Security:** `docs/security.md`; keep every route statically generated.
- **`docs/archive/`** holds superseded/historical docs and records only. Treat
  it as historical context, never as current state or guidance for new work.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
