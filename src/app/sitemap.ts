import type { MetadataRoute } from "next";
import { papers } from "@/content/research";
import { env } from "@/env";

export const dynamic = "force-static";

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
		{
			url: `${env.NEXT_PUBLIC_APP_URL}/research`,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		...papers.map((paper) => ({
			url: `${env.NEXT_PUBLIC_APP_URL}/research/${paper.slug}`,
			lastModified: paper.isoDate,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
