import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { skillGroups } from "@/content/portfolio";

export function Skills() {
	return (
		<Section id="skills" title="Skills">
			<div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
				{skillGroups.map((group, index) => (
					<Reveal key={group.title} delay={(index % 2) * 75}>
						<h3 className="text-sm font-semibold">{group.title}</h3>
						<ul className="mt-3 flex flex-wrap gap-1.5">
							{group.skills.map((skill) => (
								<li
									key={skill}
									className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300"
								>
									{skill}
								</li>
							))}
						</ul>
					</Reveal>
				))}
			</div>
		</Section>
	);
}
