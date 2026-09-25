import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import type { Paper } from "@/content/research";

/** One paper in a list: the index page and the home-page section share it. */
export function PaperCard({ paper, headingLevel = 2 }: { paper: Paper; headingLevel?: 2 | 3 }) {
	const Heading = headingLevel === 2 ? "h2" : "h3";
	return (
		<article className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
			<div className="mb-3 flex flex-wrap items-center gap-2">
				<p className="text-xs font-medium text-spartan-700 dark:text-spartan-300">{paper.kind}</p>
				{paper.status === "draft" && (
					<p className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
						Draft · not yet tested
					</p>
				)}
			</div>
			<Heading className="text-lg font-semibold tracking-tight">
				<Link
					href={`/research/${paper.slug}`}
					className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spartan-600"
				>
					{paper.title}
				</Link>
			</Heading>
			<p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
				{paper.summary}
			</p>
			<div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
				<Link
					href={`/research/${paper.slug}`}
					className="inline-flex items-center gap-1.5 font-medium text-zinc-600 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spartan-600 dark:text-zinc-400 dark:hover:text-white"
				>
					<ArrowRightIcon className="size-4" />
					Read
					<span className="sr-only"> {paper.title}</span>
				</Link>
				<span className="text-zinc-400 dark:text-zinc-500">
					{paper.date} · {paper.pdf.pages}-page PDF
				</span>
			</div>
		</article>
	);
}
