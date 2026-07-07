import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/icons";
import { person } from "@/content/portfolio";

const footerLinkClass =
	"rounded-lg p-2 text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:text-zinc-100";

export function SiteFooter() {
	return (
		<footer className="border-t border-zinc-200 dark:border-zinc-800">
			<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8">
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					© {new Date().getFullYear()} {person.name}
				</p>
				<div className="flex items-center gap-1">
					<a href={`mailto:${person.email}`} aria-label="Email" className={footerLinkClass}>
						<MailIcon className="size-4" />
					</a>
					<a
						href={person.linkedin}
						rel="me noreferrer"
						target="_blank"
						aria-label="LinkedIn"
						className={footerLinkClass}
					>
						<LinkedInIcon className="size-4" />
					</a>
					<a
						href={person.github}
						rel="me noreferrer"
						target="_blank"
						aria-label="GitHub"
						className={footerLinkClass}
					>
						<GitHubIcon className="size-4" />
					</a>
				</div>
			</div>
		</footer>
	);
}
