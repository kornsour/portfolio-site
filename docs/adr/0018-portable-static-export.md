# ADR-0018: Deploy a portable static export

- Status: Proposed
- Date: 2026-08-15

## Context

ADR-0017 removed every request-time subsystem and requires every route to be
statically generated. The Vercel-to-AWS migration should preserve that boundary
instead of placing the site behind a Lambda-based Next.js runtime it does not
need.

Next.js supports a portable `output: "export"` build, but that mode does not
support `headers()` in `next.config.ts`. Vercel remains the production and
rollback target until AWS CloudFront account verification, staging validation,
and DNS cutover are complete, so its security headers cannot be removed during
the transition.

## Decision

- Set `output: "export"` for every build. The deployable artifact is `out/` and
  no environment-specific build mode or Next.js server is allowed.
- Move the existing production security headers to `vercel.json` while Vercel
  serves production.
- Require the future AWS deployment to reproduce the same header policy with a
  CloudFront response-headers policy before it can receive traffic.
- Host the AWS artifact in a private S3 bucket behind CloudFront origin access
  control. Do not add Lambda, Lambda@Edge, a public S3 website, a database, or
  provisioned capacity for this site.
- Keep Vercel and the current domain untouched until the AWS staging URL passes
  the documented verification checklist and observation window.

This supersedes only the header-delivery location in ADR-0009 and ADR-0017; the
security policy and the static-only product boundary remain in force.

## Consequences

- `pnpm build` is both the normal CI build and the AWS artifact build. Adding a
  request-time Next.js feature will fail the build instead of silently creating
  server infrastructure.
- Security headers are hosting configuration rather than application output.
  Vercel and CloudFront configurations must remain equivalent while both are
  rollback candidates.
- Clean nested routes will require a small CloudFront request rewrite to their
  exported `.html` objects. Use CloudFront Functions if needed; do not introduce
  Lambda@Edge for path rewriting.
- AWS uploads must preserve MIME metadata for extensionless `icon` and
  `opengraph-image` objects. CloudFront should ignore their query strings in the
  cache key because the exported bytes are immutable for a given deployment.
