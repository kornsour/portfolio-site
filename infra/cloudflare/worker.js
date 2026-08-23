/**
 * portfolio-site edge — Cloudflare Worker.
 *
 * WHY THIS EXISTS. portfolio-site is a pure static export (`output: "export"`
 * in next.config.ts) — no database, no auth, no server actions, no runtime
 * secrets. It therefore needs no Lambda and no API Gateway, unlike the rest of
 * the fleet.
 *
 * WHY NOT THE MERGED infra/aws PLAN. `infra/aws` provisions S3 + CloudFront +
 * an origin access control + a CloudFront Function. AWS refuses to create
 * CloudFront distributions in this account (verification gate), so that plan
 * cannot deploy. Cloudflare's static-asset hosting does the same job: the
 * assets are served from the edge and the security headers that CloudFront
 * would have applied via a response-headers policy are applied here instead.
 *
 * WHY A WORKER RATHER THAN BARE ASSET HOSTING. A static export cannot emit
 * response headers — on Vercel they came from vercel.json. The security header
 * set below is copied verbatim from what the live Vercel deployment served, so
 * the cutover is header-for-header identical and scripts/verify-aws-static.sh
 * still passes.
 */

/**
 * Copied from the live Vercel response on 2026-08-23. Keep in sync with
 * scripts/verify-aws-static.sh, which asserts each of these.
 */
const SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "x-dns-prefetch-control": "on",
};

/**
 * Next's generated metadata images are real files with no extension, so
 * Cloudflare's asset server has no suffix to infer a type from and falls back
 * to a generic type. Vercel served them as image/png and the verify script
 * asserts exactly that, so set it explicitly.
 */
const EXTENSIONLESS_PNG = new Set(["/icon", "/opengraph-image"]);

const CANONICAL_HOST = "andrewkaiserauer.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // One canonical host: www -> apex, preserving path and query. workers.dev
    // is left alone so it stays usable for verification before DNS moves.
    if (
      url.hostname !== CANONICAL_HOST &&
      !url.hostname.endsWith(".workers.dev")
    ) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    const assetRes = await env.ASSETS.fetch(new Request(url.toString(), request));

    // Headers on the asset response are immutable; rebuild to add ours.
    const headers = new Headers(assetRes.headers);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
    if (EXTENSIONLESS_PNG.has(url.pathname)) headers.set("content-type", "image/png");

    return new Response(assetRes.body, {
      status: assetRes.status,
      statusText: assetRes.statusText,
      headers,
    });
  },
};
