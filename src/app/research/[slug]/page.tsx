import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaperArticle } from "@/components/research/paper-article";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { person } from "@/content/portfolio";
import { paperBySlug, papers } from "@/content/research";
import { env } from "@/env";

// Static export: every paper is generated at build time, nothing else exists.
export const dynamicParams = false;

export function generateStaticParams() {
	return papers.map((paper) => ({ slug: paper.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const paper = paperBySlug((await params).slug);
	if (!paper) return {};
	const url = `/research/${paper.slug}`;
	const title = paper.status === "draft" ? `${paper.title} (draft)` : paper.title;
	return {
		title,
		description: paper.summary,
		alternates: { canonical: url },
		openGraph: {
			type: "article",
			url,
			title,
			description: paper.summary,
			publishedTime: paper.isoDate,
			authors: [person.name],
		},
	};
}

export default async function ResearchPaper({ params }: Props) {
	const paper = paperBySlug((await params).slug);
	if (!paper) notFound();

	const articleJsonLd = {
		"@context": "https://schema.org",
		"@type": "ScholarlyArticle",
		headline: paper.title,
		description: paper.summary,
		datePublished: paper.isoDate,
		version: paper.version,
		creativeWorkStatus: paper.status === "draft" ? "Draft" : "Published",
		author: { "@type": "Person", name: person.name, url: env.NEXT_PUBLIC_APP_URL },
		url: `${env.NEXT_PUBLIC_APP_URL}/research/${paper.slug}`,
		encoding: {
			"@type": "MediaObject",
			encodingFormat: "application/pdf",
			contentUrl: `${env.NEXT_PUBLIC_APP_URL}${paper.pdf.href}`,
		},
	};

	return (
		<div id="top">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-spartan-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
			>
				Skip to content
			</a>
			<SiteHeader />
			<main id="main" className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
				<PaperArticle paper={paper} />
			</main>
			<SiteFooter />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from typed content, no user input
				dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
			/>
		</div>
	);
}
