import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	},
	client: {
		// Canonical site origin — used for metadata, the sitemap, OG URLs, and
		// JSON-LD. Override per-environment (e.g. a Vercel preview URL).
		NEXT_PUBLIC_APP_URL: z.url().default("https://andrewkaiserauer.com"),
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
