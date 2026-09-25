"use client";

import { useId, useState } from "react";
import { PaperCard, type PaperCardData } from "@/components/research/paper-card";
import { matches } from "@/lib/search";

export interface SearchEntry {
	paper: PaperCardData;
	/** Pre-flattened, normalized text of the whole paper (see lib/search). */
	haystack: string;
}

/**
 * Search box plus the paper grid it filters. Without JavaScript the box is
 * inert and every paper stays listed, which is the same page minus filtering.
 */
export function ResearchSearch({ entries }: { entries: readonly SearchEntry[] }) {
	const [query, setQuery] = useState("");
	const inputId = useId();
	const statusId = useId();
	const results = query.trim()
		? entries.filter((entry) => matches(entry.haystack, query))
		: entries;
	const count = results.length === 1 ? "1 paper matches" : `${results.length} papers match`;

	return (
		<>
			<search className="mt-8 block max-w-xl">
				<label htmlFor={inputId} className="sr-only">
					Search research
				</label>
				<div className="relative">
					<svg
						aria-hidden="true"
						viewBox="0 0 20 20"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.75}
						strokeLinecap="round"
						className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
					>
						<circle cx="8.5" cy="8.5" r="5.5" />
						<path d="m13 13 4 4" />
					</svg>
					<input
						id={inputId}
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search papers"
						autoComplete="off"
						spellCheck={false}
						aria-describedby={statusId}
						className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-4 pl-10 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus-visible:border-spartan-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spartan-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
					/>
				</div>
				<p
					id={statusId}
					aria-live="polite"
					className="mt-2 min-h-5 text-sm text-zinc-500 dark:text-zinc-400"
				>
					{query.trim()
						? results.length
							? `${count} “${query.trim()}”`
							: `No papers match “${query.trim()}”`
						: ""}
				</p>
			</search>
			<ul className="mt-6 grid gap-5 md:grid-cols-2">
				{results.map((entry) => (
					<li key={entry.paper.slug}>
						<PaperCard paper={entry.paper} />
					</li>
				))}
			</ul>
		</>
	);
}
