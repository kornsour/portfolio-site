/**
 * THE CANONICAL CAREER RECORD — one place per fact.
 *
 * Before this file existed there were two hand-maintained copies of the same
 * career: `src/content/portfolio.ts` (the site) and a checked-in
 * `public/resume.pdf` with no source anywhere in the repo. They drifted, which
 * is not a hypothetical: the site claimed the GE years started in 2015 while
 * the resume said Jul 2016, and a code comment asserted a Deloitte HR title
 * that turned out to be wrong.
 *
 * So: a date, a title, a metric or a bullet is written HERE, once.
 *   - `src/content/portfolio.ts` derives the site from it.
 *   - `scripts/generate-resume.mts` renders `public/resume.pdf` from it.
 * A test asserts the committed PDF is byte-identical to what this data
 * generates, so the two cannot silently diverge again.
 *
 * RULES FOR EDITING (they are the reason this is trustworthy at all):
 *   1. Never add a fact you cannot source. Every number below came from Andrew
 *      or from his own LinkedIn/resume master. If you need a fact that is not
 *      here, ask him — do not infer it.
 *   2. `independentEngineering` is NOT professional experience and must never
 *      be presented as such: no employer, no dates, its own heading, always
 *      below the employment history.
 *   3. Expired credentials carry their expiry. An undated expired certification
 *      reads as a current one, and every claim here has to survive a background
 *      check and a deep-dive interview question.
 *   4. CERTIFICATIONS ARE VERIFIED AGAINST CREDLY, NOT LINKEDIN.
 *      https://www.credly.com/earner/dashboard (his login) is the issuers' own
 *      system of record; LinkedIn is a copy he maintains by hand, and on
 *      2026-08-22 it was wrong in both directions at once — it showed the SAFe 5
 *      POPM as expired Feb 2024 when Credly has it valid to Apr 2027, and it had
 *      no entry at all for a Deloitte architecture credential issued Nov 2024.
 *      A stale mirror gets RENEWALS wrong, which is the direction that costs him
 *      a live credential on his own resume. Re-check here before editing any
 *      certification, and take the earner dashboard's dates over any other
 *      source including this file.
 *      Two traps on that site, both of which will hand you fiction:
 *        - /earner/dashboard renders his ONE Deloitte badge and then a long
 *          "Explore other badges" CAROUSEL of ~30 credentials he does NOT hold
 *          (SAFe Fellow, AWS Solutions Architect Professional, and so on).
 *          Reading that as his is how you invent a career.
 *        - the earned list is at /users/<slug>/edit/badges/credly and the count
 *          ("Credly (6)") is the check: if you have more rows than that, you are
 *          reading the carousel.
 */

export interface YearMonth {
	year: number;
	/** 1–12. */
	month: number;
}

/** Which resume cut a bullet belongs to, and how strongly. 0 = omit. */
export interface BulletWeight {
	/** The leadership / engineering-management cut. */
	em: number;
	/** The individual-contributor (Staff/Principal, AI-infra) cut. */
	ic: number;
}

export interface Bullet {
	id: string;
	text: string;
	weight: BulletWeight;
	/** Rendered in the site's Experience section as well as on the resume. */
	onSite?: boolean;
}

export interface Position {
	id: string;
	/** Short name, used by the site. */
	company: string;
	/** Full legal-ish employer line, used by the resume. */
	employer: string;
	title: string;
	location: string;
	start: YearMonth;
	/** `null` means "present". */
	end: YearMonth | null;
	bullets: readonly Bullet[];
}

export interface Certification {
	name: string;
	issued: YearMonth | null;
	expires: YearMonth | null;
	/**
	 * `unknown` means we have no dates for it and are not going to guess. It
	 * renders undated — which is honest — and is flagged in the README as an
	 * open question rather than quietly filled in.
	 */
	status: "active" | "expired" | "unknown";
}

/**
 * Numbers that appear in more than one sentence live here so they cannot drift
 * between the resume and the site.
 */
export const metrics = {
	orgSize: 33,
	squads: 4,
} as const;

export const identity = {
	/** Legal-ish name, used on the resume header. */
	fullName: "Andrew John Kaiserauer",
	/** Everyday name, used on the site. */
	name: "Andrew Kaiserauer",
	email: "ajkaiserauer@gmail.com",
	/**
	 * The resume carries a phone number; the SITE deliberately does not, and a
	 * unit test in `portfolio.test.ts` enforces that. Two different surfaces,
	 * one rule each: a recruiter reading a PDF you handed them is not the open
	 * web. This field is never imported by `portfolio.ts`.
	 */
	phone: "734-957-2852",
	location: {
		/** On the resume, where a parser wants a city. */
		resume: "Detroit, MI",
		/** On the site, where availability matters more than a city. */
		site: "Detroit metro area & remote",
	},
	website: "andrewkaiserauer.com",
	linkedin: {
		url: "https://www.linkedin.com/in/aj-kaiserauer/",
		display: "linkedin.com/in/aj-kaiserauer",
	},
	github: {
		url: "https://github.com/kornsour",
		display: "github.com/kornsour",
	},
} as const;

export const positions: readonly Position[] = [
	{
		id: "deloitte",
		company: "Deloitte",
		employer: "Deloitte US Member Firm",
		// FUNCTIONAL title — it describes the actual scope (33 reports across
		// four squads). Deloitte's internal HR title is simply "Manager" (the
		// Deloitte rank, with no discipline attached), confirmed 2026-08-22; it
		// is disclosed on application forms and background checks, which is
		// where verification happens, and is deliberately not published here.
		title: "Engineering Manager, Platform Engineering",
		location: "Detroit, MI",
		start: { year: 2021, month: 1 },
		end: null,
		bullets: [
			{
				id: "deloitte-org",
				text: `Built and lead a four-squad Platform Engineering organization of ${metrics.orgSize} engineers, wearing the product-owner, engineering-manager, and lead-architect hats across all four squads; I hire and coach the tech leads, and leads own squad roadmaps while I set org vision and the architectural bar.`,
				weight: { em: 100, ic: 55 },
				onSite: true,
			},
			{
				id: "deloitte-platform",
				text: "Run a shared multi-tenant Kubernetes platform — an internal Vercel for every team in the department — serving 40+ microservices at ~99.95% uptime; standardized CI/CD across 15 teams with golden images and GitOps (ArgoCD), cutting deployment from hours to minutes and incidents ~30%.",
				weight: { em: 90, ic: 100 },
				onSite: true,
			},
			{
				id: "deloitte-provisioning",
				text: "Built an automated platform-provisioning framework: SCIM-driven access to developer tooling, a policy enforcement engine that makes the secure path the default, health monitoring, adoption analytics, and cross-platform access intelligence for security and compliance — plus the frontend squad that fronts it.",
				weight: { em: 80, ic: 90 },
				onSite: true,
			},
			{
				id: "deloitte-tooling",
				text: "Own platform tooling and support across GitHub, Claude, Docker, and Postman for thousands of engineers firm-wide; cut operational burden ~60% through self-service tooling, standardized support lanes, and automation.",
				weight: { em: 70, ic: 60 },
				onSite: true,
			},
			{
				id: "deloitte-backstage",
				text: "Led org-wide Backstage adoption as the paved path for 50+ services, reducing onboarding from weeks to days; won over 15+ independent teams without direct authority via early-adopter demos and a hub-and-spoke model.",
				weight: { em: 60, ic: 45 },
				onSite: true,
			},
			{
				id: "deloitte-ai",
				text: "Drive AI-native engineering workflows: enterprise GitHub Copilot rollout with automated code review on pull requests and agentic issue resolution; leading enterprise AI platform evaluation across ChatGPT, Gemini, and Anthropic Enterprise.",
				weight: { em: 65, ic: 80 },
				onSite: true,
			},
		],
	},
	{
		id: "ge-aviation",
		company: "GE Aviation",
		employer: "GE Aviation",
		title: "Senior Infrastructure Architect",
		location: "Van Buren Township, MI",
		start: { year: 2018, month: 1 },
		end: { year: 2020, month: 12 },
		bullets: [
			{
				id: "ge-aviation-migrations",
				text: "Delivered 25+ cloud migrations and new builds producing ~$1.9M in infrastructure cost savings across GE Aviation, Renewables, and Transportation.",
				weight: { em: 90, ic: 90 },
				onSite: true,
			},
			{
				id: "ge-aviation-cicd",
				text: "Built self-service AWS CloudWatch dashboards for 10+ application teams and designed an AWS-native CI/CD pipeline that cut website deployment from 1 hour to 2 minutes.",
				weight: { em: 80, ic: 95 },
				onSite: true,
			},
		],
	},
	{
		id: "ge-digital",
		company: "GE Digital",
		employer: "GE Digital",
		title: "Enterprise Application Engineer",
		location: "Van Buren Township, MI",
		start: { year: 2017, month: 7 },
		end: { year: 2018, month: 1 },
		bullets: [
			{
				id: "ge-digital-cost",
				text: "Cut Digital-Healthcare AWS compute cost 6% (~$300K/year) with a sleep-schedule service for non-production instances; built a web app aggregating cloud data from AWS, Chef, ServiceNow, and Qualys into actionable operational insight.",
				weight: { em: 70, ic: 80 },
				onSite: true,
			},
		],
	},
	{
		id: "ge-healthcare",
		company: "GE Healthcare",
		employer: "GE Healthcare",
		title: "Cloud Automation Engineer",
		location: "Van Buren Township, MI",
		start: { year: 2016, month: 7 },
		end: { year: 2017, month: 7 },
		bullets: [
			{
				id: "ge-healthcare-migrations",
				text: "Led 58+ application migrations and new cloud builds saving $45K+ per month; increased team delivery speed 40% by coaching Agile teams on Scrum and Kanban.",
				weight: { em: 70, ic: 60 },
				onSite: true,
			},
		],
	},
];

/**
 * PERSONAL projects, built outside work. Andrew's `ml-research-transition`
 * note is explicit that these must never be presented as professional
 * experience — so this is a separate block with its own heading, no employer
 * and no dates, and it never merges into `positions`. Every number here is
 * measured and comes from the projects' own benchmark output.
 */
export const independentEngineering: { heading: string; bullets: readonly Bullet[] } = {
	heading: "Independent Engineering",
	bullets: [
		{
			id: "indep-inference-platform",
			text: "LLM inference platform on Kubernetes (KServe, vLLM): inference-aware autoscaling on queue depth and KV-cache utilization through a custom Go KEDA external scaler, scaling 1 to 5 replicas at ~2,360 tokens/sec aggregate for ~$0.0015–0.005 per 1M tokens; GitOps-managed, with Prometheus and Grafana.",
			weight: { em: 100, ic: 100 },
		},
		{
			id: "indep-inference-perf",
			text: "Inference performance engineering (PyTorch, CUDA): KV-cache reuse for 4.8× faster decode (O(T²) to O(T)), request batching for 3.42× throughput at batch 16, int8 dynamic quantization for a 3.6× smaller model, a custom fused-RMSNorm CUDA kernel, Megatron-style tensor parallelism, and a p50/p95 benchmark harness.",
			weight: { em: 85, ic: 100 },
		},
		{
			id: "indep-ops-triage",
			text: "Agentic ops-triage system that handles IT tickets end to end behind human approval gates, with RBAC, a hash-chained audit trail, and an evaluation harness gating every release.",
			weight: { em: 90, ic: 95 },
		},
	],
};

export const summaries = {
	em: `Engineering leader who built a ${metrics.orgSize}-person Platform Engineering organization from the ground up, serving thousands of developers across the Deloitte US Member Firm. I hire and coach tech leads, own platform architecture and delivery end to end, and stay hands-on in code. Ten years across platform engineering, cloud infrastructure, and AI-native engineering.`,
	/**
	 * DRAFT — the IC cut's summary. Same verified facts as the EM summary,
	 * re-weighted toward hands-on platform and inference work. Andrew has not
	 * reviewed this wording yet.
	 */
	ic: `Platform and infrastructure engineer, ten years deep in cloud, Kubernetes, and now LLM inference. I architect and run a multi-tenant Kubernetes platform serving 40+ microservices at ~99.95% uptime, and build inference infrastructure hands-on — a custom Go KEDA external scaler, a fused-RMSNorm CUDA kernel, and a measured performance harness. I also built and lead the ${metrics.orgSize}-person Platform Engineering organization at the Deloitte US Member Firm.`,
} as const;

/** The resume's SKILLS block. Each row renders as `Label: items…`. */
export const skillRows: readonly { id: string; label: string; text: string }[] = [
	{
		id: "leadership",
		label: "Leadership",
		text: `Engineering org design and team leadership (${metrics.orgSize} reports), hiring and coaching tech leads, roadmap ownership, platform adoption strategy, cross-functional stakeholder engagement, Agile (Scrum, Kanban, SAFe)`,
	},
	{
		id: "platform",
		label: "Platform & Infrastructure",
		text: "AWS, Azure, GCP, Kubernetes (EKS), Terraform, Docker, CI/CD, GitHub Actions/Apps, Helm, Backstage, GitOps (ArgoCD, Kustomize), Observability (Prometheus, Loki), Linux, Bash",
	},
	{
		id: "ai",
		label: "AI & LLM",
		text: "GitHub Copilot (enterprise adoption and enablement), Claude Code, Claude API integration, agentic workflow design, LLM inference infrastructure, enterprise AI platform evaluation",
	},
	{
		id: "languages",
		// Go is here because of the custom Go KEDA external scaler in
		// `indep-inference-platform` — it was missing from the old resume while
		// the project that proves it was on the page.
		label: "Languages",
		text: "Python, Go, FastAPI, Flask, JavaScript/TypeScript, Node.js, React, PowerShell",
	},
];

export const certifications: readonly Certification[] = [
	{
		// Credly, read 2026-08-22 — CURRENT, and LinkedIn is wrong about it.
		// LinkedIn shows "Expired Feb 2024"; Credly, which is the issuer's own
		// system of record, shows it valid to Apr 9 2027. Trusting LinkedIn here
		// cost him a live credential on his own resume. Renewals are exactly what
		// a stale mirror gets wrong, and this is the direction that hurts.
		name: "Certified SAFe 5 Product Owner/Product Manager",
		issued: { year: 2023, month: 2 },
		expires: { year: 2027, month: 4 },
		status: "active",
	},
	{
		// Credly, read 2026-08-22: issued Nov 1 2024. Current, does not expire.
		// It was on NEITHER the resume nor LinkedIn — an employer-issued
		// architecture credential, earned after the last resume revision, simply
		// never written down anywhere the system could see it.
		name: "Deloitte Certified Architect Level 1",
		issued: { year: 2024, month: 11 },
		expires: null,
		status: "active",
	},
	{
		// Credly, read 2026-08-22: issued May 23 2020. AZ-900 does not expire.
		// Official name carries the "Microsoft Certified:" prefix.
		name: "Microsoft Certified: Azure Fundamentals",
		issued: { year: 2020, month: 5 },
		expires: null,
		status: "active",
	},
	{
		// Credly, read 2026-08-22: expired Apr 12 2024. Issue date Apr 2021 from
		// LinkedIn; the two agree on the expiry.
		name: "AWS Certified DevOps Engineer – Professional",
		issued: { year: 2021, month: 4 },
		expires: { year: 2024, month: 4 },
		status: "expired",
	},
	{
		// Credly, read 2026-08-22. He holds this badge TWICE — expired Dec 15
		// 2020 and again Jan 25 2024, i.e. earned, renewed, lapsed again. Only
		// the later one is stated: two expired instances of one credential is a
		// certification history, not a qualification, and the resume states the
		// most recent. Official name includes "Certified", which the previous
		// hand-written entry dropped.
		name: "AWS Certified Solutions Architect – Associate",
		issued: null,
		expires: { year: 2024, month: 1 },
		status: "expired",
	},
];

export const education = {
	school: "Michigan State University",
	degree: "BS, Media & Information",
	location: "East Lansing, MI",
	graduated: { year: 2016, month: 5 } satisfies YearMonth,
	minors: "Computer Science Engineering, Information Technology, Game Design & Development",
} as const;

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

/** "Jan 2021" — the resume's date granularity. */
export function formatMonthYear(date: YearMonth): string {
	return `${MONTHS[date.month - 1]} ${date.year}`;
}

/** "Jan 2021 – Present" — a resume date range. */
export function formatResumePeriod(position: Pick<Position, "start" | "end">): string {
	const end = position.end === null ? "Present" : formatMonthYear(position.end);
	return `${formatMonthYear(position.start)} – ${end}`;
}

/** "2021 – Present" — the site's coarser date range, over one or more positions. */
export function formatSitePeriod(group: readonly Pick<Position, "start" | "end">[]): string {
	const startYear = Math.min(...group.map((position) => position.start.year));
	const open = group.some((position) => position.end === null);
	const endYear = Math.max(...group.map((position) => position.end?.year ?? 0));
	return `${startYear} – ${open ? "Present" : endYear}`;
}

export function positionById(id: string): Position {
	const found = positions.find((position) => position.id === id);
	if (!found) throw new Error(`No position with id "${id}" in career.ts`);
	return found;
}

/** "(issued Apr 2021, expired Apr 2024)", or "" when nothing is known. */
export function formatCertificationDates(certification: Certification): string {
	const parts: string[] = [];
	if (certification.issued) parts.push(`issued ${formatMonthYear(certification.issued)}`);
	if (certification.expires) {
		const word = certification.status === "expired" ? "expired" : "expires";
		parts.push(`${word} ${formatMonthYear(certification.expires)}`);
	}
	return parts.length > 0 ? `(${parts.join(", ")})` : "";
}
