import { ExternalLinkIcon, GitHubIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { alsoBuilt, projects } from "@/content/portfolio";

const projectLinkClass =
	"inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:text-white";

export function Projects() {
	return (
		<Section id="projects" title="Projects">
			<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{projects.map((project, index) => (
					<li key={project.name} className="h-full">
						<Reveal className="h-full" delay={(index % 3) * 75}>
							<article
								className={`flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 ${
									project.aiInfra
										? "border-indigo-200 dark:border-indigo-900"
										: "border-zinc-200 dark:border-zinc-800"
								}`}
							>
								{project.aiInfra && (
									<p className="mb-3 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
										AI Infrastructure
									</p>
								)}
								<h3 className="font-semibold tracking-tight">{project.name}</h3>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
									{project.description}
								</p>
								<ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
									{project.tech.map((tech) => (
										<li
											key={tech}
											className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
										>
											{tech}
										</li>
									))}
								</ul>
								<div className="mt-5 flex items-center gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
									<a
										href={project.repo}
										rel="noreferrer"
										target="_blank"
										className={projectLinkClass}
									>
										<GitHubIcon className="size-4" />
										Code
										<span className="sr-only"> for {project.name}</span>
									</a>
									{project.live && (
										<a
											href={project.live}
											rel="noreferrer"
											target="_blank"
											className={projectLinkClass}
										>
											<ExternalLinkIcon className="size-4" />
											Live site
											<span className="sr-only"> for {project.name}</span>
										</a>
									)}
								</div>
							</article>
						</Reveal>
					</li>
				))}
			</ul>
			<Reveal>
				<p className="mt-8 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
					Also built:{" "}
					{alsoBuilt.map((item, index) => (
						<span key={item.name}>
							<a
								href={item.repo}
								rel="noreferrer"
								target="_blank"
								className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-950 hover:decoration-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:text-white"
							>
								{item.name}
							</a>{" "}
							({item.description}){index < alsoBuilt.length - 1 ? ", " : "."}
						</span>
					))}
				</p>
			</Reveal>
		</Section>
	);
}
