# Cloudflare edge Worker — `portfolio-site`

This Worker is the CDN layer for portfolio-site. It exists because AWS refuses to create
CloudFront distributions in these accounts (verification gate, support case
178741276400319), so Cloudflare does CloudFront's routing job instead.

It does **not** run Next.js. The application still executes exactly as OpenNext
built it for AWS Lambda; this Worker only routes.

## Deploying

**This is automatic.** `.github/workflows/cloudflare-deploy.yml` builds and
deploys on every push to `main`, once CI has gone green on that commit. It
needs two repository secrets, `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`; without them the workflow fails loudly rather than
skipping.

It did not always work that way, and the failure mode is worth knowing because
nothing about it looks broken: from the Cloudflare cutover until 2026-08-24 the
upload was a manual step nobody was prompted to run, so `main` went green while
the site kept serving an older build. It was two commits stale before anyone
noticed. That is why the workflow ends by comparing the bytes it just built
against the bytes actually being served (`scripts/verify-cloudflare-static.sh`)
— a route-and-header sweep alone passes just as happily against a stale
deployment.

To deploy by hand — recovering from a failed run, or testing a `worker.js`
change — build first, since `wrangler` uploads `out`, which is build output and
is not committed:

```
pnpm build
cd infra/cloudflare && npx wrangler deploy
./scripts/verify-cloudflare-static.sh   # from the repo root
```

## The cutover is a DNS toggle

`routes` only take effect over **proxied** DNS records. The app's records keep
their original origin (Vercel) as their content, so flipping `proxied` back to
`false` in Cloudflare is a complete, immediate rollback.

## Two bugs this file already carries fixes for — do not "simplify" them away

1. **The `ASSETS` lookup is guarded to GET/HEAD.** `env.ASSETS.fetch()`
   consumes the request body. Calling it unconditionally leaves nothing for the
   origin proxy and throws `Body has already been used` on every POST/PUT/
   PATCH — Cloudflare error 1101 / HTTP 500. **GETs are unaffected, so the app
   passes a status-code smoke test while every sign-in, form submission and
   upload is broken.** This shipped live and went unnoticed for exactly that
   reason (found and fixed 2026-08-23).

2. **The request body is buffered with `arrayBuffer()`.** Passing
   `request.body` (a ReadableStream) into `fetch` throws in the Workers
   runtime, and `duplex: "half"` on the `Request` constructor does not fix
   it. Buffering costs streaming, which is acceptable here.

**When changing this file, test a POST, not just a GET.** A GET-only check
cannot detect either bug:

```
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  -H 'Content-Type: application/json' -d '{}' https://<host>/api/auth/...
```

A 500 means the Worker threw. Use `npx wrangler tail` to read the actual
exception — the status code alone will not tell you which of the two faults
you have.
