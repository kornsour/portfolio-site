import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

describe("AWS static deployment profile", () => {
	it("keeps the S3 origin private and uses signed CloudFront OAC requests", async () => {
		const config = await readFile("infra/aws/main.tf", "utf8");

		expect(config).toContain('object_ownership = "BucketOwnerEnforced"');
		expect(config).toContain("block_public_acls       = true");
		expect(config).toContain("block_public_policy     = true");
		expect(config).toContain("restrict_public_buckets = true");
		expect(config).toContain('signing_behavior                  = "always"');
		expect(config).toContain('identifiers = ["cloudfront.amazonaws.com"]');
		expect(config).toContain('variable = "AWS:SourceArn"');
		expect(config).not.toContain("aws_lambda");
	});

	it("matches the Vercel rollback header policy", async () => {
		const [awsConfig, vercelConfigText] = await Promise.all([
			readFile("infra/aws/main.tf", "utf8"),
			readFile("vercel.json", "utf8"),
		]);
		const vercelConfig = JSON.parse(vercelConfigText);
		const securityHeaders = Object.fromEntries(
			vercelConfig.headers[2].headers.map(({ key, value }: { key: string; value: string }) => [
				key,
				value,
			]),
		);

		expect(awsConfig).toContain(securityHeaders["Content-Security-Policy"]);
		expect(awsConfig).toContain(securityHeaders["Referrer-Policy"]);
		expect(awsConfig).toContain(securityHeaders["Permissions-Policy"]);
		expect(awsConfig).toContain(`value    = "${securityHeaders["X-DNS-Prefetch-Control"]}"`);
		expect(awsConfig).toContain("content_type_options {");
		expect(awsConfig).toContain(`frame_option = "${securityHeaders["X-Frame-Options"]}"`);
		expect(awsConfig).toContain("access_control_max_age_sec = 63072000");
		expect(awsConfig).toContain("include_subdomains         = true");
		expect(awsConfig).toContain("preload                    = true");
	});

	it("rewrites only exported page routes", async () => {
		const code = await readFile("infra/aws/rewrite.js", "utf8");
		const context: { handler?: (event: { request: { uri: string } }) => { uri: string } } = {};
		vm.runInNewContext(code, context);
		const rewrite = (uri: string) => context.handler?.({ request: { uri } }).uri;

		expect(rewrite("/")).toBe("/index.html");
		expect(rewrite("/writing/agent-guardrails")).toBe("/writing/agent-guardrails.html");
		expect(rewrite("/writing/agent-guardrails/")).toBe("/writing/agent-guardrails.html");
		expect(rewrite("/robots.txt")).toBe("/robots.txt");
		expect(rewrite("/_next/static/chunks/app.js")).toBe("/_next/static/chunks/app.js");
		expect(rewrite("/icon")).toBe("/icon");
		expect(rewrite("/opengraph-image")).toBe("/opengraph-image");
	});

	it("uses OIDC and preserves cache and MIME metadata during deployment", async () => {
		const workflow = await readFile(".github/workflows/aws-deploy.yml", "utf8");

		expect(workflow).toContain("environment: aws-production");
		expect(workflow).toContain("id-token: write");
		expect(workflow).toContain("portfolio-site-github-deploy");
		expect(workflow).toContain("S3_ORIGIN:");
		expect(workflow).toContain("--delete");
		expect(workflow).toContain("public,max-age=31536000,immutable");
		expect(workflow.match(/--content-type image\/png/g)).toHaveLength(2);
		expect(workflow).not.toMatch(/AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY/);
	});
});
