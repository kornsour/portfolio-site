import type { Metadata } from "next";
import { toCardData } from "@/components/research/paper-card";
import { ResearchSearch } from "@/components/research/research-search";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { papers, researchDescription, researchHeading } from "@/content/research";
import { searchText } from "@/lib/search";

const title = "Research";

export const metadata: Metadata = {
	title,
	description: researchDescription,
	alternates: { canonical: "/research" },
	openGraph: { type: "website", url: "/research", title, description: researchDescription },
};

export default function ResearchIndex() {
	return (
		<div id="top">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-spartan-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
			>
				Skip to content
			</a>
			<SiteHeader />
			<main id="main" className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
				<p className="text-sm font-semibold uppercase tracking-widest text-spartan-600 dark:text-spartan-400">
					Research
				</p>
				<h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{researchHeading}
				</h1>
				<ResearchSearch
					entries={papers.map((paper) => ({
						paper: toCardData(paper),
						haystack: searchText(paper),
					}))}
				/>
			</main>
			<SiteFooter />
		</div>
	);
}
