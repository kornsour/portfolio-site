import type { MetadataRoute } from "next";
import { env } from "@/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
	};
}
