#!/usr/bin/env bash
#
# Post-deploy smoke test for the Cloudflare edge Worker (infra/cloudflare).
#
# The sibling of scripts/verify-aws-static.sh, minus the S3-origin check that
# script opens with — there is no bucket here, so there is no "origin must not
# be publicly readable" assertion to make.
#
# Run by .github/workflows/cloudflare-deploy.yml immediately after
# `wrangler deploy`, and runnable by hand against the live site:
#
#   ./scripts/verify-cloudflare-static.sh
#   ORIGIN=https://www.andrewkaiserauer.com ./scripts/verify-cloudflare-static.sh
set -euo pipefail

ORIGIN="${ORIGIN:-https://andrewkaiserauer.com}"

# ─────────────────────────────────────────────────────────────────────────
# 1. Every route the static export emits still answers 200.
# ─────────────────────────────────────────────────────────────────────────
for route in / /writing/agent-guardrails /robots.txt /sitemap.xml /icon /opengraph-image /resume.pdf; do
	status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "${ORIGIN}${route}")"
	if [ "$status" != "200" ]; then
		echo "verify: ${route} returned ${status}, expected 200" >&2
		exit 1
	fi
done

# not_found_handling: "404-page" must yield a real 404 status, not a 200 that
# merely renders the 404 body — the latter is invisible to a route sweep and
# tells crawlers a dead URL is live.
status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "${ORIGIN}/no-such-page")"
if [ "$status" != "404" ]; then
	echo "verify: /no-such-page returned ${status}, expected 404" >&2
	exit 1
fi

# ─────────────────────────────────────────────────────────────────────────
# 2. The seven security headers. A static export cannot emit these; they
#    exist only because worker.js attaches them, so a Worker regression drops
#    them silently while every route still returns 200.
# ─────────────────────────────────────────────────────────────────────────
headers="$(curl --fail --silent --show-error --dump-header - --output /dev/null "${ORIGIN}/")"
grep -qi '^content-security-policy:' <<<"$headers"
grep -qi '^strict-transport-security: max-age=63072000; includesubdomains; preload' <<<"$headers"
grep -qi '^x-content-type-options: nosniff' <<<"$headers"
grep -qi '^x-frame-options: DENY' <<<"$headers"
grep -qi '^referrer-policy: strict-origin-when-cross-origin' <<<"$headers"
grep -qi '^permissions-policy: camera=(), microphone=(), geolocation=()' <<<"$headers"
grep -qi '^x-dns-prefetch-control: on' <<<"$headers"

# Next emits /icon and /opengraph-image without a file extension, so Cloudflare
# cannot infer their type — worker.js sets it explicitly.
for route in /icon /opengraph-image; do
	content_type="$(curl --fail --silent --show-error --head "${ORIGIN}${route}" | tr -d '\r' | awk -F': ' 'tolower($1) == "content-type" { print tolower($2) }')"
	if [ "$content_type" != "image/png" ]; then
		echo "verify: ${route} served content-type '${content_type}', expected image/png" >&2
		exit 1
	fi
done

# ─────────────────────────────────────────────────────────────────────────
# 3. THE POINT OF THIS SCRIPT: is the build we just made actually the build
#    being served?
#
# Everything above passes just as happily against a months-old deployment —
# which is exactly the failure this repo already hit once: main went green,
# nobody ran `wrangler deploy`, and the site kept serving an older build while
# every status-code check stayed green. Comparing the served bytes to the
# local ones is the only assertion here that can tell the difference.
#
# The Worker passes asset bodies through unmodified, so / is byte-identical to
# out/index.html. Retried because the edge cache can serve the previous copy
# for a few seconds after an upload.
# ─────────────────────────────────────────────────────────────────────────
if [ ! -f out/index.html ]; then
	echo "verify: no out/index.html — skipping the freshness check (run pnpm build first to enable it)." >&2
	exit 0
fi

local_hash="$(shasum -a 256 out/index.html | cut -d' ' -f1)"
for attempt in $(seq 1 10); do
	served_hash="$(curl --fail --silent --show-error --header 'Cache-Control: no-cache' "${ORIGIN}/" | shasum -a 256 | cut -d' ' -f1)"
	if [ "$served_hash" = "$local_hash" ]; then
		echo "verify: ${ORIGIN} is serving this build (sha256 ${local_hash:0:12}…)."
		exit 0
	fi
	echo "verify: attempt ${attempt}/10 — edge still serving ${served_hash:0:12}…, want ${local_hash:0:12}…" >&2
	sleep 6
done

echo "verify: ${ORIGIN} never served this build. The deploy reported success but the site is stale." >&2
exit 1
