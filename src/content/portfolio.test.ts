import { describe, expect, it } from "vitest";
import * as portfolio from "./portfolio";
import { about, alsoBuilt, person, projects, roles, skillGroups } from "./portfolio";

describe("portfolio content", () => {
	it("only surfaces valid https project links", () => {
		for (const project of projects) {
			for (const link of project.links ?? []) {
				expect(link.url).toMatch(/^https:\/\//);
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

	it("gives every AI infrastructure project a public code link", () => {
		for (const project of projects.filter((p) => p.aiInfra)) {
			expect(project.links?.some((l) => l.url.includes("github.com/kornsour/"))).toBe(true);
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
	});

	it("keeps the real job title without inflating the level", () => {
		expect(person.title).toContain("Manager, Platform Engineering");
		const everything = JSON.stringify(portfolio);
		expect(everything).not.toMatch(/Director|Senior Manager/);
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
