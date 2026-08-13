import type { MetadataRoute } from "next";
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: env.NEXT_PUBLIC_APP_URL,
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${env.NEXT_PUBLIC_APP_URL}/writing/agent-guardrails`,
			changeFrequency: "yearly",
			priority: 0.8,
		},
	];
}
