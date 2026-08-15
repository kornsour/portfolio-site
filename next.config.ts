import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// The site has no request-time features. Emit portable files for Vercel now
	// and the private S3/CloudFront target after AWS account verification.
	output: "export",
	experimental: {
		useTypeScriptCli: true,
	},
};

export default nextConfig;
