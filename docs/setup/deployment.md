# Deployment (portable static export)

`pnpm build` writes the complete deployable site to `out/`. There is no Next.js
server artifact and no request-time application compute.

## First deploy

```bash
vercel link              # link dir → Vercel project
vercel deploy            # preview
vercel deploy --prod     # production
```

No environment variables are required — the canonical URL defaults to
`https://andrewkaiserauer.com` in `src/env.ts`. Set `NEXT_PUBLIC_APP_URL` in
Vercel only if that ever changes.

`vercel.json` applies the production security headers that Next.js cannot emit
in static-export mode. Verify them on every preview before promotion.

## AWS target

The accepted AWS profile lives in `infra/aws`; `.github/workflows/aws-deploy.yml`
builds, plans, uploads, and verifies it through GitHub OIDC. The protected
`aws-production` environment trusts only `main`.

After the Applications account is verified for CloudFront resource creation:

1. Merge the shared `portfolio-site-github-deploy` OIDC role and configure the
   GitHub `aws-production` environment to allow only `main`.
2. Dispatch **AWS static deploy** in `plan` mode and review the exact additions.
3. Dispatch it in `apply` mode. The workflow uploads `out/` with explicit cache
   and MIME metadata, invalidates CloudFront, waits for deployment, and verifies
   the staging hostname.
4. Decide the retained production domain, issue and validate its ACM certificate
   in `us-east-1`, then set `aliases` and `acm_certificate_arn` together.
5. Validate the custom domain before changing Cloudflare DNS. Keep Vercel
   production available through the observation window.

The profile uses an unversioned private bucket, AES-256 S3 encryption, signed
OAC requests, `PriceClass_100`, a five-minute HTML default, immutable hashed
assets, no query strings in cache keys, and one viewer-request CloudFront
Function. It deliberately omits Lambda, Lambda@Edge, WAF, access-log delivery,
Origin Shield, and provisioned capacity to avoid standing charges at this site's
traffic level.

Do not create this stack until the account-level CloudFront verification blocker
is cleared; an S3-only partial deployment does not provide a usable staging URL.

## Custom domain (Cloudflare DNS)

```bash
vercel domains add andrewkaiserauer.com <project>   # prints the required DNS record + target
cf dns records create -z andrewkaiserauer.com --body '{"type":"A","name":"@","content":"76.76.21.21","ttl":1,"proxied":false}'
cf dns records create -z andrewkaiserauer.com --body '{"type":"CNAME","name":"www","content":"cname.vercel-dns.com","ttl":1,"proxied":false}'
vercel domains inspect andrewkaiserauer.com         # poll until it shows a valid configuration
```

Use the target/record type `vercel domains add` actually prints (Vercel has
changed the anycast IP before). Keep the Cloudflare records **DNS only**
(`proxied: false`) until Vercel confirms the certificate — a proxied
(orange-cloud) record in front of Vercel's edge/TLS can block issuance. If you
want Cloudflare's proxy afterward, set its SSL/TLS mode to Full (strict) first.

## Post-deploy checklist

1. `https://andrewkaiserauer.com` loads with a valid certificate; `www` redirects.
2. `/resume.pdf` serves the real resume (replace the committed placeholder).
3. OG card renders (paste the URL into a LinkedIn/Slack preview).
4. `robots.txt` and `sitemap.xml` reference the production domain.
5. The CSP, HSTS, frame, MIME, referrer, DNS-prefetch, and permissions headers
   match the policy in `vercel.json`.
6. The S3 origin rejects direct unauthenticated requests.
7. CloudFront metrics show requests on the AWS distribution for the observation
   window before Vercel domains and the project are removed.

## CI

`.github/workflows/ci.yml` runs Biome, `tsc`, Vitest, and the static export via
`pnpm build` on every push/PR. `src/deployment-config.test.ts` prevents the
export mode and Vercel rollback headers from drifting. E2E runs locally only
([ADR-0008](../adr/0008-e2e-local-only.md)).
