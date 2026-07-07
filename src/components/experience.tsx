import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { roles } from "@/content/portfolio";

export function Experience() {
	return (
		<Section id="experience" title="Experience">
			<ol className="max-w-3xl">
				{roles.map((role) => (
					<li
						key={`${role.company}-${role.period}`}
						className="relative border-l border-zinc-200 pb-12 pl-8 last:pb-0 dark:border-zinc-800"
					>
						<span
							aria-hidden="true"
							className="absolute top-1.5 -left-[5px] size-[9px] rounded-full bg-indigo-600 ring-4 ring-white dark:bg-indigo-400 dark:ring-zinc-950"
						/>
						<Reveal>
							<p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
								{role.period}
							</p>
							<h3 className="mt-1 text-lg font-semibold tracking-tight">
								{role.title}
								<span className="font-normal text-zinc-500 dark:text-zinc-400">
									{" "}
									· {role.company}
								</span>
							</h3>
							<ul className="mt-4 space-y-2.5">
								{role.highlights.map((highlight) => (
									<li
										key={highlight}
										className="flex gap-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
									>
										<span
											aria-hidden="true"
											className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600"
										/>
										{highlight}
									</li>
								))}
							</ul>
						</Reveal>
					</li>
				))}
			</ol>
		</Section>
	);
}
