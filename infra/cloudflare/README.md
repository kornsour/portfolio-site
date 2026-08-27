# Cloudflare edge Worker — `portfolio-site`

This Worker is the CDN layer for portfolio-site. It exists because AWS refuses to create
CloudFront distributions in these accounts (verification gate, support case
178741276400319), so Cloudflare does CloudFront's routing job instead.

It does **not** run Next.js, and there is no origin behind it. `next.config.ts`
sets `output: "export"`, so a build is a directory of static files; this Worker
serves those files from the `ASSETS` binding and attaches the response headers a
static export cannot emit on its own. No Lambda, no API Gateway, no server
runtime of any kind — see [ADR-0017](../../docs/adr/0017-static-portfolio-strip-down.md)
and [ADR-0018](../../docs/adr/0018-portable-static-export.md).

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

`routes` only take effect over **proxied** DNS records, so flipping `proxied`
back to `false` on the zone's DNS record in Cloudflare is a complete,
immediate rollback of this Worker.

## What this file actually does — do not "simplify" it away

`worker.js` has three jobs, in this order:

1. **One canonical host.** `www` — or any other hostname the Worker is reached
   on — is 301'd to `andrewkaiserauer.com`, preserving path and query.
   `*.workers.dev` is deliberately exempt, so the Worker stays verifiable on its
   own hostname before the zone's DNS records are proxied.
2. **Serve the static export.** `env.ASSETS.fetch()` returns the built file.
   It is called for every method, which is correct here: nothing sits
   downstream of it, so no proxied request body is at stake.
3. **Attach the response headers.** `wrangler.jsonc` sets `run_worker_first` so
   the Worker runs ahead of the asset server on every request and can add them.
   Headers on the asset response are immutable, so the response is rebuilt
   around `assetRes.body` rather than mutated in place.

Two constants look removable and are not:

- **`SECURITY_HEADERS`** is the site's entire header policy, and it is asserted
  outside this directory: `scripts/verify-aws-static.sh` greps for each header
  by name, and the AWS profile in `infra/aws` reproduces the same set. Changing
  a value here means changing it in both.
- **`EXTENSIONLESS_PNG`** covers `/icon` and `/opengraph-image`, which Next
  emits as real files with no extension. Cloudflare's asset server has no
  suffix to infer a type from and falls back to a generic one, so the type is
  set explicitly; the verify script asserts `image/png` for both.

**When changing this file, check the headers, not just the status code.** Every
route returns 200 whether or not the header set survived:

```
curl -sS -D - -o /dev/null https://<host>/
curl -sS -D - -o /dev/null https://<host>/icon | grep -i '^content-type'
```

If the Worker throws instead, use `npx wrangler tail` to read the actual
exception — the status code alone will not tell you what failed.
