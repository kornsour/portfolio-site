# Documentation

Project documentation for this portfolio site.

## Contents

- [`setup/`](./setup) — [getting started](./setup/getting-started.md) and
  [deployment](./setup/deployment.md) (Vercel + Cloudflare DNS).
- [`security.md`](./security.md) — the security posture and pre-deploy checklist.
- [`adr/`](./adr) — Architecture Decision Records: the _why_ behind the stack
  and conventions, including [ADR-0017](./adr/0017-static-portfolio-strip-down.md),
  which records how this repo was stripped down from `typescript-template`.
- [`maintenance/`](./maintenance) — operational runbooks (lockfile recovery).

## Conventions

- Decisions that shape the architecture or are costly to reverse get an ADR.
- Each ADR is immutable once `Accepted`; to change a decision, add a new ADR
  that supersedes the old one (and mark the old one `Superseded by ADR-XXXX`).
