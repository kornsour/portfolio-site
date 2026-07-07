import { describe, expect, it } from "vitest";
import * as portfolio from "./portfolio";
import { about, alsoBuilt, person, projects, roles, skillGroups } from "./portfolio";

describe("portfolio content", () => {
	it("only surfaces public project links, never private repo links", () => {
		for (const project of projects) {
			if (project.link) {
				expect(project.link.url).toMatch(/^https:\/\//);
				expect(project.link.label.length).toBeGreaterThan(0);
				// Private GitHub repos are not surfaced while the code is being cleaned up.
				expect(project.link.url).not.toMatch(/github\.com\/kornsour/);
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
