import { describe, expect, it } from "vitest";
import {
	certifications,
	formatCertificationDates,
	formatResumePeriod,
	formatSitePeriod,
	identity,
	independentEngineering,
	positionById,
	positions,
} from "./career";
import { person, roles } from "./portfolio";

describe("the canonical career record", () => {
	it("has a strictly ordered, gap-checked employment history", () => {
		const asMonths = (date: { year: number; month: number }) => date.year * 12 + date.month;
		for (const position of positions) {
			if (position.end) {
				expect(asMonths(position.end)).toBeGreaterThan(asMonths(position.start));
			}
		}
		// Newest first — both surfaces render in array order.
		for (let i = 1; i < positions.length; i++) {
			const previous = positions[i - 1];
			const current = positions[i];
			if (!previous || !current) continue;
			expect(asMonths(previous.start)).toBeGreaterThan(asMonths(current.start));
		}
	});

	it("starts Deloitte in Jan 2021", () => {
		// The date that older tailored resumes got wrong. It is written once now.
		expect(formatResumePeriod(positionById("deloitte"))).toBe("Jan 2021 – Present");
	});

	it("gives every bullet a unique id", () => {
		const ids = [
			...positions.flatMap((position) => position.bullets.map((bullet) => bullet.id)),
			...independentEngineering.bullets.map((bullet) => bullet.id),
		];
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("dates a certification whenever it has an expiry, and never invents one", () => {
		for (const certification of certifications) {
			if (certification.status === "expired") {
				expect(certification.expires).not.toBeNull();
				expect(formatCertificationDates(certification)).toContain("expired");
			}
			if (certification.status === "unknown") {
				expect(formatCertificationDates(certification)).toBe("");
			}
		}
	});
});

describe("the site derives from the career record, it does not restate it", () => {
	it("takes the person's title and links from the record", () => {
		expect(person.title).toContain(positionById("deloitte").title);
		expect(person.email).toBe(identity.email);
		expect(person.linkedin).toBe(identity.linkedin.url);
	});

	it("derives every site period from the same dates the resume uses", () => {
		expect(roles[0]?.period).toBe(formatSitePeriod([positionById("deloitte")]));
		expect(roles[2]?.period).toBe(
			formatSitePeriod([positionById("ge-digital"), positionById("ge-healthcare")]),
		);
		// The old hand-written site said 2015; the earliest date anyone can
		// actually source is Jul 2016. Deriving it is what fixed that.
		expect(roles[2]?.period).toBe("2016 – 2018");
	});

	it("shows only bullets that exist in the career record", () => {
		const known = new Set(
			positions.flatMap((position) => position.bullets.map((bullet) => bullet.text)),
		);
		for (const role of roles) {
			for (const highlight of role.highlights) expect(known.has(highlight)).toBe(true);
		}
	});

	it("keeps the phone number off the site while the resume carries it", () => {
		expect(identity.phone).toMatch(/\d{3}-\d{3}-\d{4}/);
		expect(JSON.stringify({ person, roles })).not.toContain(identity.phone);
	});
});
