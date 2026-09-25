import { expect, test } from "@playwright/test";

test("homepage renders all main sections", async ({ page }) => {
	await page.goto("/");

	// Hero
	await expect(
		page.getByRole("heading", {
			level: 1,
			name: /Engineering and platform leader/,
		}),
	).toBeVisible();
	await expect(page.getByRole("link", { name: "View work" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Get in touch" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Download resume" })).toHaveAttribute(
		"href",
		"/resume.pdf",
	);

	// Sections
	for (const id of ["about", "experience", "projects", "skills", "contact"]) {
		await expect(page.locator(`section#${id}`)).toBeAttached();
	}

	// Experience shows the real title, projects show the AI-infra spotlight.
	await expect(page.getByRole("heading", { name: /Manager, Platform Engineering/ })).toBeVisible();
	await expect(page.getByText("AI Infrastructure").first()).toBeAttached();
	await expect(page.getByRole("heading", { name: "inference-platform" })).toBeAttached();
	// Public project link is shown; private-repo projects show a "Coming soon" marker.
	await expect(page.getByRole("link", { name: /View site/ })).toBeAttached();
	await expect(page.getByText("Coming soon").first()).toBeAttached();

	// Contact
	await expect(page.getByRole("link", { name: /ajkaiserauer@gmail\.com/ })).toBeAttached();
});

test("theme toggle switches dark mode", async ({ page }) => {
	await page.goto("/");
	const initiallyDark = await page.evaluate(() =>
		document.documentElement.classList.contains("dark"),
	);
	await page.getByRole("button", { name: "Toggle color theme" }).click();
	const nowDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
	expect(nowDark).toBe(!initiallyDark);
});

test("research papers are reachable, readable, and downloadable", async ({ page }) => {
	await page.goto("/research");
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

	await page.getByRole("link", { name: "Cheapest per token is not cheapest per task", exact: true }).click();
	await expect(page).toHaveURL(/\/research\/model-routing$/);
	await expect(page.getByRole("img", { name: /cost per completed task against pass rate/i })).toBeVisible();
	const pdf = page.getByRole("link", { name: /Download the PDF \(16 pages\)/ });
	const response = await page.request.get((await pdf.getAttribute("href")) ?? "");
	expect(response.status()).toBe(200);

	// The pre-registration must never read as a result.
	await page.goto("/research/route-on-evidence");
	await expect(page.getByRole("note")).toContainText("not yet registered and not yet run");
});
