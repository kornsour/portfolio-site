import { describe, expect, it } from "vitest";
import { paperBySlug, papers } from "@/content/research";
import { matches, normalize, searchText } from "./search";

describe("research search", () => {
	it("normalizes case, accents and curly quotes", () => {
		expect(normalize("Don’t CAFÉ “Auto”")).toBe(`don't cafe "auto"`);
	});

	it("matches every term, in any order, anywhere in the text", () => {
		const haystack = normalize("Cheapest per token is not cheapest per task");
		expect(matches(haystack, "task cheapest")).toBe(true);
		expect(matches(haystack, "  TOKEN  ")).toBe(true);
		expect(matches(haystack, "token router")).toBe(false);
		expect(matches(haystack, "")).toBe(true);
	});

	it("searches a paper's body, not just its title and summary", () => {
		// "RouteLLM" appears only in the white paper's body sections.
		const whitePaper = paperBySlug("model-routing");
		expect(whitePaper).toBeDefined();
		if (!whitePaper) return;
		expect(normalize(`${whitePaper.title} ${whitePaper.summary}`)).not.toContain("routellm");
		expect(matches(searchText(whitePaper), "RouteLLM")).toBe(true);
	});

	it("finds a draft by the word draft, and tells the papers apart", () => {
		const hits = (query: string) =>
			papers.filter((paper) => matches(searchText(paper), query)).map((paper) => paper.slug);
		expect(hits("draft")).toContain("route-on-evidence");
		expect(hits("Michelin")).toEqual(["route-on-evidence"]);
		expect(hits("zzzz-no-such-term")).toEqual([]);
	});
});
