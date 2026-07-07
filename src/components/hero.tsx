import { DownloadIcon, GitHubIcon, LinkedInIcon } from "@/components/icons";
import { person } from "@/content/portfolio";

const iconLinkClass =
	"inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";

export function Hero() {
	return (
		<section aria-label="Introduction" className="py-20 sm:py-32">
			<p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
				{person.title} · {person.location}
			</p>
			<h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				{person.headline}
			</h1>
			<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
				{person.valueProp}
			</p>
			<div className="mt-10 flex flex-wrap items-center gap-3">
				<a
					href="#projects"
					className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					View work
				</a>
				<a
					href="#contact"
					className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:hover:bg-zinc-900"
				>
					Get in touch
				</a>
			</div>
			<div className="mt-6 flex flex-wrap items-center gap-1">
				<a href={person.linkedin} rel="me noreferrer" target="_blank" className={iconLinkClass}>
					<LinkedInIcon className="size-4" />
					LinkedIn
				</a>
				<a href={person.github} rel="me noreferrer" target="_blank" className={iconLinkClass}>
					<GitHubIcon className="size-4" />
					GitHub
				</a>
				<a href={person.resumeHref} download className={iconLinkClass}>
					<DownloadIcon className="size-4" />
					Download resume
				</a>
			</div>
		</section>
	);
}
