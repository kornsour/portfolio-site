# Cloudflare edge Worker — `portfolio-site`

This Worker is the CDN layer for portfolio-site. It exists because AWS refuses to create
CloudFront distributions in these accounts (verification gate, support case
178741276400319), so Cloudflare does CloudFront's routing job instead.

It does **not** run Next.js. The application still executes exactly as OpenNext
built it for AWS Lambda; this Worker only routes.

## Deploying

Build first — `wrangler` uploads `out`, which is build output and is not
committed:

```
pnpm build
cd infra/cloudflare && npx wrangler deploy
```

## The cutover is a DNS toggle

`routes` only take effect over **proxied** DNS records, so flipping `proxied`
back to `false` on the zone's DNS record in Cloudflare is a complete,
immediate rollback of this Worker.

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
