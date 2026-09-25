import type { Metadata } from "next";
import { PaperCard } from "@/components/research/paper-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { papers, researchHeading, researchIntro } from "@/content/research";

const title = "Research";

export const metadata: Metadata = {
	title,
	description: researchIntro,
	alternates: { canonical: "/research" },
	openGraph: { type: "website", url: "/research", title, description: researchIntro },
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
				<p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
					{researchIntro}
				</p>
				<ul className="mt-12 grid gap-5 md:grid-cols-2">
					{papers.map((paper) => (
						<li key={paper.slug}>
							<PaperCard paper={paper} />
						</li>
					))}
				</ul>
			</main>
			<SiteFooter />
		</div>
	);
}
