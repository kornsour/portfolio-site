import Link from "next/link";
import { ArrowRightIcon, DownloadIcon, GitHubIcon } from "@/components/icons";
import { ResearchFigure } from "@/components/research/figures";
import { type Block, type Paper, paperBySlug } from "@/content/research";

/** Body copy shares one measure and rhythm with the writing pages. */
const p = "leading-relaxed text-zinc-700 dark:text-zinc-300";
const h2 =
	"mt-16 mb-4 scroll-mt-20 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white";
const buttonBase =
	"inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spartan-600";

export function DraftNotice({ note }: { note: string }) {
	return (
		<div
			role="note"
			className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
		>
			<strong className="font-semibold">Draft · </strong>
			{note}
		</div>
	);
}

function BlockView({ block }: { block: Block }) {
	switch (block.type) {
		case "p":
			return <p className={`mt-4 ${p}`}>{block.text}</p>;
		case "list": {
			const ListTag = block.ordered ? "ol" : "ul";
			return (
				<ListTag
					className={`mt-4 space-y-3 pl-6 ${block.ordered ? "list-decimal" : "list-disc"} marker:text-zinc-400 dark:marker:text-zinc-500 ${p}`}
				>
					{block.items.map((item) => (
						<li key={item.lead ?? item.text} className="pl-1">
							{item.lead && (
								<strong className="font-semibold text-zinc-950 dark:text-white">
									{item.lead}{" "}
								</strong>
							)}
							{item.text}
						</li>
					))}
				</ListTag>
			);
		}
		case "table":
			return (
				<figure className="mt-8">
					<div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
						<table className="w-full min-w-[32rem] border-collapse text-left text-sm">
							<caption className="border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
								{block.caption}
							</caption>
							<thead>
								<tr className="border-b border-zinc-200 dark:border-zinc-800">
									{block.columns.map((column) => (
										<th
											key={column}
											scope="col"
											className="px-4 py-2 font-medium text-zinc-500 dark:text-zinc-400"
										>
											{column}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{block.rows.map((row) => (
									<tr
										key={row.join("|")}
										className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/70"
									>
										{row.map((cell, index) =>
											index === 0 ? (
												<th
													// biome-ignore lint/suspicious/noArrayIndexKey: cells are positional
													key={index}
													scope="row"
													className="px-4 py-2.5 align-top font-medium text-zinc-900 dark:text-zinc-100"
												>
													{cell}
												</th>
											) : (
												<td
													// biome-ignore lint/suspicious/noArrayIndexKey: cells are positional
													key={index}
													className="px-4 py-2.5 align-top tabular-nums text-zinc-700 dark:text-zinc-300"
												>
													{cell}
												</td>
											),
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{block.note && (
						<figcaption className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
							{block.note}
						</figcaption>
					)}
				</figure>
			);
		case "figure":
			return (
				<figure className="mt-8 rounded-lg border border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
					<ResearchFigure figure={block.figure} />
					<figcaption className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
						{block.caption}
					</figcaption>
				</figure>
			);
		case "callout":
			return (
				<aside className="mt-8 rounded-lg border border-spartan-200 bg-spartan-50 px-5 py-4 dark:border-spartan-900 dark:bg-spartan-950/60">
					<p className="text-sm font-semibold uppercase tracking-widest text-spartan-700 dark:text-spartan-300">
						{block.title}
					</p>
					<p className="mt-2 leading-relaxed text-zinc-800 dark:text-zinc-200">{block.text}</p>
				</aside>
			);
	}
}

export function PaperArticle({ paper }: { paper: Paper }) {
	const companion = paper.companion ? paperBySlug(paper.companion) : undefined;
	return (
		<article>
			<header>
				<p className="text-sm font-semibold uppercase tracking-widest text-spartan-600 dark:text-spartan-400">
					{paper.kind}
				</p>
				<h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{paper.title}
				</h1>
				<p className={`mt-4 text-lg ${p}`}>{paper.subtitle}</p>
				<p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
					Andrew Kaiserauer · {paper.date} · {paper.version}
				</p>
				{paper.status === "draft" && paper.statusNote && (
					<div className="mt-6">
						<DraftNotice note={paper.statusNote} />
					</div>
				)}
				<div className="mt-6 flex flex-wrap gap-3">
					<a
						href={paper.pdf.href}
						download={paper.pdf.fileName}
						className={`${buttonBase} bg-spartan-600 text-white shadow-sm hover:bg-spartan-500`}
					>
						<DownloadIcon className="size-4" />
						Download the PDF ({paper.pdf.pages} pages)
					</a>
					<a
						href={paper.repo}
						rel="noreferrer"
						target="_blank"
						className={`${buttonBase} border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800`}
					>
						<GitHubIcon className="size-4" />
						Harness and data
					</a>
				</div>
			</header>

			<dl className="mt-10 grid gap-4 sm:grid-cols-2">
				{paper.stats.map((stat) => (
					<div
						key={stat.value + stat.label}
						className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
					>
						<dt className="sr-only">{stat.label}</dt>
						<dd>
							<span className="block text-3xl font-semibold tracking-tight text-spartan-700 tabular-nums dark:text-spartan-300">
								{stat.value}
							</span>
							<span className="mt-1 block text-sm leading-snug text-zinc-600 dark:text-zinc-400">
								{stat.label}
							</span>
						</dd>
					</div>
				))}
			</dl>

			{paper.lede.map((paragraph) => (
				<p key={paragraph} className={`mt-6 ${p}`}>
					{paragraph}
				</p>
			))}

			<nav
				aria-label="Contents"
				className="mt-10 rounded-lg border border-zinc-200 px-5 py-4 dark:border-zinc-800"
			>
				<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contents</p>
				<ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
					{paper.sections.map((section) => (
						<li key={section.id}>
							<a
								href={`#${section.id}`}
								className="text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spartan-600 dark:text-zinc-400 dark:hover:text-white"
							>
								{section.heading}
							</a>
						</li>
					))}
				</ol>
			</nav>

			{paper.sections.map((section) => (
				<section key={section.id} aria-labelledby={section.id}>
					<h2 id={section.id} className={h2}>
						{section.heading}
					</h2>
					{section.blocks.map((block, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: blocks are static and ordered
						<BlockView key={index} block={block} />
					))}
				</section>
			))}

			<footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
				<p className={`text-sm ${p}`}>
					This page condenses the paper. The PDF is the version of record, with the full method,
					every table, and the complete reference list.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
					<a
						href={paper.pdf.href}
						download={paper.pdf.fileName}
						className="inline-flex items-center gap-1.5 text-spartan-600 transition-colors hover:text-spartan-700 dark:text-spartan-400 dark:hover:text-spartan-300"
					>
						<DownloadIcon className="size-4" />
						Download the PDF
					</a>
					{companion && (
						<Link
							href={`/research/${companion.slug}`}
							className="inline-flex items-center gap-1.5 text-spartan-600 transition-colors hover:text-spartan-700 dark:text-spartan-400 dark:hover:text-spartan-300"
						>
							<ArrowRightIcon className="size-4" />
							Companion paper: {companion.title}
						</Link>
					)}
					<Link
						href="/research"
						className="text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
					>
						← All research
					</Link>
				</div>
			</footer>
		</article>
	);
}
