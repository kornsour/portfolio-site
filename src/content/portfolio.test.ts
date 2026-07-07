import { describe, expect, it } from "vitest";
import * as portfolio from "./portfolio";
import { about, alsoBuilt, person, projects, roles, skillGroups } from "./portfolio";

describe("portfolio content", () => {
	it("every project links to a kornsour GitHub repo", () => {
		for (const project of projects) {
			expect(project.repo).toMatch(/^https:\/\/github\.com\/kornsour\//);
		}
		for (const item of alsoBuilt) {
			expect(item.repo).toMatch(/^https:\/\/github\.com\/kornsour\//);
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

	it("has non-empty about paragraphs, roles, and skill groups", () => {
		expect(about.length).toBeGreaterThanOrEqual(2);
		expect(roles.length).toBe(3);
		for (const role of roles) {
			expect(role.highlights.length).toBeGreaterThan(0);
		}
		for (const group of skillGroups) {
			expect(group.skills.length).toBeGreaterThan(0);
		}
	});
});
