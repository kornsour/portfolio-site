# Deployment (Vercel + Cloudflare DNS)

## First deploy

```bash
vercel link              # link dir → Vercel project
vercel deploy            # preview
vercel deploy --prod     # production
```

No environment variables are required — the canonical URL defaults to
`https://andrewkaiserauer.com` in `src/env.ts`. Set `NEXT_PUBLIC_APP_URL` in
Vercel only if that ever changes.

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

## CI

`.github/workflows/ci.yml` runs Biome, `tsc`, Vitest, and `pnpm build` on every
push/PR. E2E runs locally only ([ADR-0008](../adr/0008-e2e-local-only.md)).
