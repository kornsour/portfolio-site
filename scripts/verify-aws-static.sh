#!/usr/bin/env bash
set -euo pipefail

: "${STAGING_ORIGIN:?Set STAGING_ORIGIN to the CloudFront origin, including https://}"
: "${S3_ORIGIN:?Set S3_ORIGIN to the regional S3 origin, including https://}"

direct_status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "${S3_ORIGIN}/index.html")"
test "$direct_status" = "403"

for route in / /writing/agent-guardrails /robots.txt /sitemap.xml /icon /opengraph-image; do
	status="$(curl --fail-with-body --silent --show-error --output /dev/null --write-out '%{http_code}' "${STAGING_ORIGIN}${route}")"
	test "$status" = "200"
done

headers="$(curl --fail --silent --show-error --dump-header - --output /dev/null "${STAGING_ORIGIN}/")"
grep -qi '^content-security-policy:' <<<"$headers"
grep -qi '^strict-transport-security: max-age=63072000; includesubdomains; preload' <<<"$headers"
grep -qi '^x-content-type-options: nosniff' <<<"$headers"
grep -qi '^x-frame-options: DENY' <<<"$headers"
grep -qi '^referrer-policy: strict-origin-when-cross-origin' <<<"$headers"
grep -qi '^permissions-policy: camera=(), microphone=(), geolocation=()' <<<"$headers"
grep -qi '^x-dns-prefetch-control: on' <<<"$headers"

for route in /icon /opengraph-image; do
	content_type="$(curl --fail --silent --show-error --head "${STAGING_ORIGIN}${route}" | tr -d '\r' | awk -F': ' 'tolower($1) == "content-type" { print tolower($2) }')"
	test "$content_type" = "image/png"
done
