import type { Paper } from "@/content/research";

/**
 * Plain-text search for the research index. There are a handful of papers and
 * the site is a static export, so this is a substring match over a flattened
 * copy of each paper's text, done in the browser — no index, no library.
 */

/** Lowercase, strip accents, and straighten curly quotes so "don’t" finds "don't". */
export function normalize(text: string): string {
	return text
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.toLowerCase();
}

/** Every piece of reader-visible text in a paper, flattened and normalized. */
export function searchText(paper: Paper): string {
	const parts: string[] = [
		paper.title,
		paper.kind,
		paper.subtitle,
		paper.summary,
		paper.statusNote ?? "",
		paper.status === "draft" ? "draft" : "",
		...paper.stats.flatMap((stat) => [stat.value, stat.label]),
		...paper.lede,
	];
	for (const section of paper.sections) {
		parts.push(section.heading);
		for (const block of section.blocks) {
			switch (block.type) {
				case "p":
					parts.push(block.text);
					break;
				case "list":
					for (const item of block.items) parts.push(item.lead ?? "", item.text);
					break;
				case "table":
					parts.push(block.caption, ...block.columns, ...block.rows.flat(), block.note ?? "");
					break;
				case "figure":
					parts.push(block.caption);
					break;
				case "callout":
					parts.push(block.title, block.text);
					break;
			}
		}
	}
	return normalize(parts.filter(Boolean).join(" \n "));
}

/** True when every whitespace-separated term of `query` appears in `haystack`. */
export function matches(haystack: string, query: string): boolean {
	const terms = normalize(query).split(/\s+/).filter(Boolean);
	return terms.every((term) => haystack.includes(term));
}
