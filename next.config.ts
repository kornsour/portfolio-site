import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// The site has no request-time features. Emit a portable static export
	// served today by the Cloudflare Worker in infra/cloudflare, with the
	// S3/CloudFront profile in infra/aws ready once AWS account verification
	// clears.
	output: "export",
	experimental: {
		useTypeScriptCli: true,
	},
};

export default nextConfig;
