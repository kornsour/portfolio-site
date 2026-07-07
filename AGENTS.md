# AGENTS.md

This project's agent guidance lives in [`CLAUDE.md`](./CLAUDE.md) — read it first.

Quick pointers for any coding agent (Claude Code, Codex, Cursor, …):

- **This is a fully static portfolio site.** No database, no auth, no server
  actions, no env vars required. Don't reintroduce them
  ([ADR-0017](./docs/adr/0017-static-portfolio-strip-down.md)).
- **Content edits go in `src/content/portfolio.ts`**, never in components.
  Never invent metrics, employers, titles, or credentials; no phone number.
- **Setup:** `pnpm install && pnpm dev`.
- **Before committing:** `pnpm check:fix && pnpm test`. A commit hook enforces this.
- **Foundational changes:** read the relevant ADR in `docs/adr/` first; add a
  superseding ADR when you change a decision.
- **Security:** `docs/security.md`; keep every route statically generated.
