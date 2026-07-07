import { ThemeToggle } from "@/components/theme-toggle";
import { nav, person } from "@/content/portfolio";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
			<div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
				<a
					href="#top"
					className="text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
				>
					{person.name}
				</a>
				<div className="flex items-center gap-1">
					<nav aria-label="Section navigation" className="hidden sm:block">
						<ul className="flex items-center gap-1">
							{nav.map((item) => (
								<li key={item.href}>
									<a
										href={item.href}
										className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
									>
										{item.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
