import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

const requiredHeaders = {
	"Content-Security-Policy":
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
	"X-Content-Type-Options": "nosniff",
	"X-DNS-Prefetch-Control": "on",
	"X-Frame-Options": "DENY",
};

describe("deployment configuration", () => {
	it("emits a portable static export without a Next.js server", () => {
		expect(nextConfig.output).toBe("export");
		expect("headers" in nextConfig).toBe(false);
	});

	it("preserves the security-header policy on the Vercel rollback target", async () => {
		const vercelConfig = JSON.parse(await readFile("vercel.json", "utf8"));
		expect(vercelConfig.framework).toBe("nextjs");
		expect(vercelConfig.headers).toHaveLength(3);
		expect(vercelConfig.headers.slice(0, 2)).toEqual([
			{
				source: "/icon",
				headers: [{ key: "Content-Type", value: "image/png" }],
			},
			{
				source: "/opengraph-image",
				headers: [{ key: "Content-Type", value: "image/png" }],
			},
		]);

		const securityRule = vercelConfig.headers[2];
		expect(securityRule.source).toBe("/(.*)");

		const actualHeaders = Object.fromEntries(
			securityRule.headers.map(({ key, value }: { key: string; value: string }) => [key, value]),
		);
		expect(actualHeaders).toEqual(requiredHeaders);
	});
});
