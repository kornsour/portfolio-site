import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { nav } from "./portfolio";
import * as research from "./research";
import { costByTokenType, costVsPass, type Paper, papers } from "./research";

const publicDir = join(__dirname, "../../public");

describe("research papers", () => {
	it("has unique, URL-safe slugs", () => {
		const slugs = papers.map((paper) => paper.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
	});

	it("ships every paper's PDF, and nothing else, under public/research", () => {
		// The page condenses the paper; the PDF is the version of record. A page
		// whose download 404s is worse than no page.
		for (const paper of papers) {
			expect(paper.pdf.href).toMatch(/^\/research\/[a-z0-9.-]+\.pdf$/);
			const file = join(publicDir, paper.pdf.href);
			expect(existsSync(file), `${paper.pdf.href} is missing from public/`).toBe(true);
			expect(readFileSync(file).subarray(0, 5).toString()).toBe("%PDF-");
		}
		// Anything else in public/research is served at a guessable URL whether or
		// not a page links to it, so an orphaned or superseded PDF is still
		// published. Remove old versions when a paper is revised.
		const linked = new Set(papers.map((paper) => paper.pdf.href.replace("/research/", "")));
		for (const file of readdirSync(join(publicDir, "research"))) {
			expect(linked, `public/research/${file} is not linked from any paper`).toContain(file);
		}
	});

	it("labels a draft as a draft, everywhere a reader can find it", () => {
		// A pre-registration publishes predictions, not results. Readers must not
		// mistake one for the other: the banner, the version line and the PDF name
		// all say so.
		const drafts = papers.filter((paper) => paper.status === "draft");
		expect(drafts.length).toBeGreaterThan(0);
		for (const paper of drafts) {
			expect(paper.statusNote).toMatch(/not yet/i);
			expect(paper.version).toMatch(/not yet (registered|tested)/i);
			expect(paper.pdf.fileName).toMatch(/draft/i);
			expect(paper.pdf.href).toMatch(/draft/i);
		}
	});

	it("links companion papers that exist", () => {
		for (const paper of papers) {
			if (paper.companion) {
				expect(papers.map((other) => other.slug)).toContain(paper.companion);
				expect(paper.companion).not.toBe(paper.slug);
			}
		}
	});

	it("gives every paper a public repo, stats, and non-empty sections with unique anchors", () => {
		for (const paper of papers) {
			expect(paper.repo).toMatch(/^https:\/\/github\.com\/kornsour\//);
			expect(paper.stats.length).toBeGreaterThan(0);
			expect(paper.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			const ids = paper.sections.map((section) => section.id);
			expect(new Set(ids).size).toBe(ids.length);
			for (const section of paper.sections) expect(section.blocks.length).toBeGreaterThan(0);
		}
	});

	it("keeps the redrawn charts consistent with the paper's tables", () => {
		// Figure 2's segments are token counts × list prices; they must add up to
		// the per-session cost the paper reports, or the chart is drawing a
		// different number than the table beside it.
		for (const row of costByTokenType) {
			expect(row.cacheReads + row.cacheWrites + row.output).toBeCloseTo(row.total, 2);
		}
		// Figure 1 plots the same numbers as the results table.
		const resultsTable = findTable(papers[0], "The primary test passed by a wide margin");
		for (const point of costVsPass) {
			const cost = `$${point.cost.toFixed(3)}`;
			expect(resultsTable.some((row) => row.some((cell) => cell.startsWith(cost)))).toBe(true);
		}
	});

	it("never exposes a phone number", () => {
		expect(JSON.stringify(research)).not.toMatch(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/);
	});

	it("is reachable from the site navigation", () => {
		expect(nav.map((item) => item.href)).toContain("/research");
		// Section links must work from sub-pages too, so they are root-relative.
		for (const item of nav) expect(item.href.startsWith("/")).toBe(true);
	});
});

function findTable(paper: Paper | undefined, caption: string) {
	for (const section of paper?.sections ?? []) {
		for (const block of section.blocks) {
			if (block.type === "table" && block.caption === caption) return block.rows;
		}
	}
	throw new Error(`No table captioned "${caption}"`);
}
