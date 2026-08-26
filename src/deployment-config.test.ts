import { describe, expect, it } from "vitest";
import { EXTENSIONLESS_PNG, SECURITY_HEADERS } from "../infra/cloudflare/worker.js";
import nextConfig from "../next.config";

const requiredHeaders = {
	"content-security-policy":
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
	"permissions-policy": "camera=(), microphone=(), geolocation=()",
	"referrer-policy": "strict-origin-when-cross-origin",
	"strict-transport-security": "max-age=63072000; includeSubDomains; preload",
	"x-content-type-options": "nosniff",
	"x-dns-prefetch-control": "on",
	"x-frame-options": "DENY",
};

describe("deployment configuration", () => {
	it("emits a portable static export without a Next.js server", () => {
		expect(nextConfig.output).toBe("export");
		expect("headers" in nextConfig).toBe(false);
	});

	// Next.js can't emit headers() in static-export mode, so the production
	// security policy lives in infra/cloudflare/worker.js — the live production
	// path — instead. src/aws-deployment-config.test.ts covers the same policy
	// in infra/aws/main.tf, the AWS profile pending account verification. See
	// docs/adr/0018-portable-static-export.md.
	it("preserves the security-header policy on the live Cloudflare Worker", () => {
		expect(SECURITY_HEADERS).toEqual(requiredHeaders);
		expect(EXTENSIONLESS_PNG).toEqual(new Set(["/icon", "/opengraph-image"]));
	});
});
