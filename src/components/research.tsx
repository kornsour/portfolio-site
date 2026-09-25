import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { PaperCard } from "@/components/research/paper-card";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { papers } from "@/content/research";

/** Home-page teaser for /research. The nav link is desktop-only; this is how phones get there. */
export function Research() {
	return (
		<Section id="research" title="Research">
			<ul className="grid gap-5 md:grid-cols-2">
				{papers.map((paper, index) => (
					<li key={paper.slug} className="h-full">
						<Reveal className="h-full" delay={index * 75}>
							<PaperCard paper={paper} headingLevel={3} />
						</Reveal>
					</li>
				))}
			</ul>
			<Reveal>
				<Link
					href="/research"
					className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-spartan-600 transition-colors hover:text-spartan-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spartan-600 dark:text-spartan-400 dark:hover:text-spartan-300"
				>
					<ArrowRightIcon className="size-4" />
					All research
				</Link>
			</Reveal>
		</Section>
	);
}
