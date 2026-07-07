import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Skills } from "@/components/skills";
import { person } from "@/content/portfolio";
import { env } from "@/env";

const personJsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: person.name,
	email: `mailto:${person.email}`,
	jobTitle: "Manager, Platform Engineering",
	worksFor: { "@type": "Organization", name: "Deloitte" },
	url: env.NEXT_PUBLIC_APP_URL,
	sameAs: [person.linkedin, person.github],
	address: {
		"@type": "PostalAddress",
		addressLocality: "Detroit metro area",
		addressRegion: "MI",
		addressCountry: "US",
	},
};

export default function Home() {
	return (
		<div id="top">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
			>
				Skip to content
			</a>
			<SiteHeader />
			<main id="main" className="mx-auto w-full max-w-5xl px-6">
				<Hero />
				<About />
				<Experience />
				<Projects />
				<Skills />
				<Contact />
			</main>
			<SiteFooter />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from typed content, no user input
				dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
			/>
		</div>
	);
}
