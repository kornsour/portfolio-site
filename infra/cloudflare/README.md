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

"Once CI has gone green" depends on CI running on `main` at all. That only
happens when the merge is not made with `GITHUB_TOKEN`, so auto-merge needs its
own `AUTO_MERGE_TOKEN` secret. From 2026-09-13 to 2026-09-25 it had none, and
nothing deployed. See
[ADR-0022](../../docs/adr/0022-auto-merge-token-triggers-main-ci.md).

### Deploy credentials

Create the token at dash.cloudflare.com → My Profile → API Tokens → Create
Token → **Create Custom Token**. Grant exactly these permissions:

| Scope   | Permission      | Access | Why                                                                                          |
| ------- | --------------- | ------ | -------------------------------------------------------------------------------------------- |
| Account | Workers Scripts | Edit   | Upload `portfolio-edge` and its assets; attach the `akaiserauer.com` custom domains           |
| Zone    | Workers Routes  | Edit   | The `andrewkaiserauer.com/*` redirect routes                                                  |
| Zone    | DNS             | Edit   | A custom domain makes wrangler create the proxied DNS record on `akaiserauer.com`             |
| Zone    | Zone            | Read   | wrangler looks each zone up by name (`zone_name`, custom-domain hostnames)                    |

- **Account Resources:** include the account that owns `portfolio-edge` only.
- **Zone Resources:** include the specific zones `akaiserauer.com` **and**
  `andrewkaiserauer.com`. A token scoped to the old zone alone fails on the
  custom domains. Before PR #72 that was the only zone the Worker used.
- Set an expiry and a reminder to rotate. An expired token fails the "Require
  deploy credentials" step no differently from a missing one.

Then, under GitHub → Settings → Secrets and variables → Actions, add both as
**repository** secrets (or as secrets of the `cloudflare-production`
environment, which the deploy job uses):

- `CLOUDFLARE_API_TOKEN`: the token above.
- `CLOUDFLARE_ACCOUNT_ID`: the account ID from the dashboard's Workers &
  Pages overview. Setting it also means wrangler skips account discovery, so
  the token needs no `User`/`Memberships` permissions.

If a deploy fails with an authentication error on a specific API path, that
path names the missing permission. Add that one permission rather than reaching
for the broad "Edit Cloudflare Workers" template.

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

## Domains

`akaiserauer.com` and `www.akaiserauer.com` are attached as **custom domains**:
`wrangler deploy` creates their proxied DNS records and certificates, so the
deploy token needs Workers and DNS edit access on the `akaiserauer.com` zone as
well as the old one.

`andrewkaiserauer.com` (and `www.`) is the previous domain. It stays attached
through ordinary `routes` over its existing **proxied** DNS records, only so the
Worker can 301 it to `akaiserauer.com`. Flipping `proxied` back to `false` on
that zone's records detaches the Worker from the old domain immediately.

## What this file actually does — do not "simplify" it away

`worker.js` has three jobs, in this order:

1. **One canonical host.** `www`, the previous domain `andrewkaiserauer.com`,
   or any other hostname the Worker is reached on is 301'd to `akaiserauer.com`,
   preserving path and query — which is what keeps old links to the previous
   domain working.
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
