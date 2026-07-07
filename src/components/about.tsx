import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { about } from "@/content/portfolio";

export function About() {
	return (
		<Section id="about" title="About">
			<Reveal>
				<div className="max-w-3xl space-y-5">
					{about.map((paragraph) => (
						<p key={paragraph} className="leading-relaxed text-zinc-700 dark:text-zinc-300">
							{paragraph}
						</p>
					))}
				</div>
			</Reveal>
		</Section>
	);
}
