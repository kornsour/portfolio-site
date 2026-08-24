import { describe, expect, it } from "vitest";
import * as portfolio from "./portfolio";
import { about, alsoBuilt, person, projects, roles, skillGroups } from "./portfolio";

describe("portfolio content", () => {
	it("only surfaces valid https project links", () => {
		for (const project of projects) {
			for (const link of project.links ?? []) {
				// Internal links are same-origin routes; everything else must be https.
				expect(link.url).toMatch(link.internal ? /^\// : /^https:\/\//);
				expect(link.label.length).toBeGreaterThan(0);
			}
		}
	});

	it("links code repos only for repos that have been made public", () => {
		// Keep in sync with the actual repo visibility on GitHub. SaaS repos
		// (e.g. deCuisine) stay private and must never gain a repo link.
		const publicRepos = [
			"inference-platform",
			"llm-inference-performance",
			"ops-triage-agent",
			"micro-ceo",
			"design-system",
		];
		for (const project of projects) {
			for (const link of project.links ?? []) {
				const match = link.url.match(/github\.com\/kornsour\/([^/]+)/);
				if (match) {
					expect(publicRepos).toContain(match[1]);
				}
			}
		}
		const deCuisine = projects.find((p) => p.name === "deCuisine");
		expect(deCuisine?.links?.some((l) => l.url.includes("github.com"))).toBe(false);
	});

	it("gives every AI infrastructure project a public code link, or says why not", () => {
		for (const project of projects.filter((p) => p.aiInfra)) {
			const hasPublicCode = project.links?.some((l) => l.url.includes("github.com/kornsour/"));
			// A private repo is allowed to lead the grid only if the card explains
			// itself — an unexplained card with no code link reads as vapor.
			if (!hasPublicCode) {
				expect(project.note?.length ?? 0).toBeGreaterThan(0);
				expect(project.links?.length ?? 0).toBeGreaterThan(0);
			}
		}
	});

	it("features the AI infrastructure projects prominently (first, and flagged)", () => {
		const aiProjects = projects.filter((p) => p.aiInfra);
		expect(aiProjects.length).toBeGreaterThanOrEqual(3);
		// The AI projects lead the grid.
		expect(projects.slice(0, aiProjects.length).every((p) => p.aiInfra)).toBe(true);
	});

	it("every project has a description and at least one tech tag", () => {
		for (const project of projects) {
			expect(project.description.length).toBeGreaterThan(20);
			expect(project.tech.length).toBeGreaterThan(0);
		}
	});

	it("never exposes a phone number anywhere in the content", () => {
		const everything = JSON.stringify(portfolio);
		expect(everything).not.toMatch(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/);
	});

	it("presents as Platform Engineering, not Developer Experience", () => {
		const everything = JSON.stringify(portfolio);
		expect(everything).not.toMatch(/developer experience/i);
	});

	it("has the required contact channels and resume path", () => {
		expect(person.email).toBe("ajkaiserauer@gmail.com");
		expect(person.linkedin).toContain("linkedin.com/in/");
		expect(person.github).toBe("https://github.com/kornsour");
		expect(person.resumeHref).toBe("/resume.pdf");
		expect(person.resumeFileName).toMatch(/\.pdf$/);
	});

	it("uses the functional title and never claims a higher level", () => {
		// Deloitte's internal HR title ("Lead Infrastructure Engineer II") describes
		// almost none of the actual scope — 33 reports across four squads — so the
		// site uses the functional title. The HR title is disclosed on application
		// forms and background checks, which is where verification happens; it is
		// deliberately not published here, and the level is never inflated past
		// what he actually does.
		expect(person.title.startsWith("Engineering Manager, Platform Engineering")).toBe(true);
		for (const role of roles.filter((r) => r.company === "Deloitte")) {
			expect(role.title).toBe("Engineering Manager, Platform Engineering");
		}
		// Level inflation is a property of the title fields, not the prose — a
		// project description may legitimately mention a "VP Eng" agent.
		for (const claimed of [person.title, ...roles.map((r) => r.title)]) {
			expect(claimed).not.toMatch(/Director|Senior Manager|Head of|VP |Vice President/);
		}
		const everything = JSON.stringify(portfolio);
		expect(everything).not.toMatch(/Director|Senior Manager/);
	});

	it("shows Deloitte as one continuous role, not a title change", () => {
		// The HR title has been "Manager, Cloud Architecture" since 2021 and still
		// is; splitting it implied he left that title in 2022. Site and resume
		// must agree on one unbroken entry.
		const deloitte = roles.filter((r) => r.company === "Deloitte");
		expect(deloitte.length).toBe(1);
		expect(deloitte[0]?.period).toBe("2021 – Present");
	});

	it("has non-empty about paragraphs, roles, skills, and also-built breadth", () => {
		expect(about.length).toBeGreaterThanOrEqual(2);
		expect(roles.length).toBe(3);
		for (const role of roles) {
			expect(role.highlights.length).toBeGreaterThan(0);
		}
		for (const group of skillGroups) {
			expect(group.skills.length).toBeGreaterThan(0);
		}
		for (const item of alsoBuilt) {
			expect(item.name.length).toBeGreaterThan(0);
			expect(item.description.length).toBeGreaterThan(0);
		}
	});
});
