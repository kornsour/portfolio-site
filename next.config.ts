import type { NextConfig } from "next";

/**
 * Security headers applied to every response (see docs/adr/0009-security-headers.md).
 *
 * The template's per-request nonce CSP (ADR-0014, src/proxy.ts) is gone: this
 * site is fully static, and nonces require per-request rendering. A static CSP
 * needs 'unsafe-inline' for Next's own bootstrap scripts — acceptable here
 * because the site holds no sessions, cookies, or user data.
 */
const isDev = process.env.NODE_ENV !== "production";

const csp = [
	`default-src 'self'`,
	// 'unsafe-eval' is required by Turbopack HMR in dev only.
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
	`style-src 'self' 'unsafe-inline'`,
	`img-src 'self' data:`,
	`font-src 'self'`,
	`connect-src 'self'`,
	`frame-ancestors 'none'`,
	`base-uri 'self'`,
	`form-action 'self'`,
	`object-src 'none'`,
].join("; ");

const securityHeaders = [
	{ key: "Content-Security-Policy", value: csp },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
	{ key: "X-DNS-Prefetch-Control", value: "on" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
