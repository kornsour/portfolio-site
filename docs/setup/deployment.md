# Deployment (portable static export)

`pnpm build` writes the complete deployable site to `out/`. There is no Next.js
server artifact and no request-time application compute.

## Production: Cloudflare Worker

`infra/cloudflare` is the live production path. AWS refuses to create
CloudFront distributions in this account (verification gate, support case
178741276400319), so a Cloudflare Worker does that routing job instead and
applies the security headers a static export can't emit itself:

```bash
pnpm build
cd infra/cloudflare && npx wrangler deploy
```

No environment variables are required — the canonical URL defaults to
`https://andrewkaiserauer.com` in `src/env.ts`. Set `NEXT_PUBLIC_APP_URL` only
if that ever changes.

`infra/cloudflare/worker.js` applies the production security headers (CSP,
HSTS, frame options, MIME, referrer, DNS-prefetch, permissions) that Next.js
cannot emit in static-export mode, and forces `www` → apex. Verify them after
every deploy. See [`infra/cloudflare/README.md`](../../infra/cloudflare/README.md)
for the deploy details and two request-handling bugs already fixed there.

## Pending: AWS S3/CloudFront

The accepted long-term profile lives in `infra/aws`; `.github/workflows/aws-deploy.yml`
builds, plans, uploads, and verifies it through GitHub OIDC. The protected
`aws-production` environment trusts only `main`. It cannot deploy until AWS
clears the CloudFront verification gate above.

Once the Applications account is verified for CloudFront resource creation:

1. Merge the shared `portfolio-site-github-deploy` OIDC role and configure the
   GitHub `aws-production` environment to allow only `main`.
2. Dispatch **AWS static deploy** in `plan` mode and review the exact additions.
3. Dispatch it in `apply` mode. The workflow uploads `out/` with explicit cache
   and MIME metadata, invalidates CloudFront, waits for deployment, and verifies
   the staging hostname.
4. Decide the retained production domain, issue and validate its ACM certificate
   in `us-east-1`, then set `aliases` and `acm_certificate_arn` together.
5. Validate the custom domain before cutting the Cloudflare DNS record over
   from the Worker to CloudFront.

The profile uses an unversioned private bucket, AES-256 S3 encryption, signed
OAC requests, `PriceClass_100`, a five-minute HTML default, immutable hashed
assets, no query strings in cache keys, and one viewer-request CloudFront
Function. It deliberately omits Lambda, Lambda@Edge, WAF, access-log delivery,
Origin Shield, and provisioned capacity to avoid standing charges at this site's
traffic level.

Do not create this stack until the account-level CloudFront verification blocker
is cleared; an S3-only partial deployment does not provide a usable staging URL.

## Post-deploy checklist

1. `https://andrewkaiserauer.com` loads with a valid certificate; `www` redirects.
2. `/resume.pdf` serves the real resume (replace the committed placeholder).
3. OG card renders (paste the URL into a LinkedIn/Slack preview).
4. `robots.txt` and `sitemap.xml` reference the production domain.
5. The CSP, HSTS, frame, MIME, referrer, DNS-prefetch, and permissions headers
   match the policy in `infra/cloudflare/worker.js` (and, once live,
   `infra/aws/main.tf`).
6. The S3 origin rejects direct unauthenticated requests (once the AWS profile
   is live).
7. CloudFront metrics show requests on the AWS distribution for the observation
   window before the Cloudflare Worker route is retired.

## CI

`.github/workflows/ci.yml` runs Biome, `tsc`, Vitest, and the static export via
`pnpm build` on every push/PR. `src/deployment-config.test.ts` and
`src/aws-deployment-config.test.ts` prevent the export mode and the security
header policy from drifting across `infra/cloudflare/worker.js` and
`infra/aws/main.tf`. E2E runs locally only
([ADR-0008](../adr/0008-e2e-local-only.md)).
