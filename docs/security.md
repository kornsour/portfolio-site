# Security posture

This is a fully static, content-driven portfolio: no auth, no database, no
server actions, no cookies, no user input. The attack surface is accordingly
small. (The template's auth/DB/billing controls were removed with those
subsystems — see [ADR-0017](./adr/0017-static-portfolio-strip-down.md).)

## What's built in

| Area | Control | Where |
|------|---------|-------|
| Transport / headers | HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. | `next.config.ts`, [ADR-0009](./adr/0009-security-headers.md) |
| XSS | Static CSP header: `default-src 'self'`, no external script/connect/frame origins, `object-src 'none'`, `frame-ancestors 'none'`. `'unsafe-inline'` for scripts is required by static generation and accepted — the site holds no sessions or user data. | `next.config.ts`, [ADR-0017](./adr/0017-static-portfolio-strip-down.md) |
| Injected content | All rendered content comes from the typed, committed `src/content/portfolio.ts` — nothing user-supplied. The two `dangerouslySetInnerHTML` uses (theme-init snippet, JSON-LD) are static strings built from that file. | `src/app/layout.tsx`, `src/app/page.tsx` |
| Content guarantees | Unit tests assert no phone number appears in content and links point where expected. | `src/content/portfolio.test.ts` |
| Secrets | No server secrets exist; the only env var is the public site URL, validated at the boundary. | `src/env.ts`, [ADR-0006](./adr/0006-type-safe-env.md) |

## Pre-deploy checklist

1. `NEXT_PUBLIC_APP_URL` matches the real HTTPS domain (or rely on the default).
2. External links to third-party sites use `rel="noreferrer"` (they do — keep it
   that way when adding new ones).
3. Nothing personal beyond what's intended ships in `src/content/portfolio.ts`
   or `public/` (`pnpm test` guards the phone-number case).
4. Run the **`/security-review`** skill on the diff before merging significant changes.
