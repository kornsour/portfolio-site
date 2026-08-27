/**
 * All site content lives here. Edit this file — not the components — to update
 * the bio, projects, or skills.
 *
 * EXCEPT for the facts the resume also states. Employment dates, job titles,
 * role bullets and the org size come from `./career.ts`, the canonical career
 * record that `scripts/generate-resume.mts` also renders into
 * `public/resume.pdf`. Two hand-maintained copies of one career is what this
 * file used to be half of, and they drifted: the GE years said 2015 here and
 * Jul 2016 on the resume. Add a career FACT to `career.ts`; add site PROSE
 * (headline, value prop, about, projects) here.
 */

import { formatSitePeriod, identity, metrics, positionById } from "./career";

export const person = {
	name: identity.name,
	headline: "Engineering and platform leader who builds the systems other engineers build on",
	valueProp: `I run a ${metrics.orgSize}-person Platform Engineering org at Deloitte and build AI infrastructure hands-on, from multi-tenant Kubernetes platforms to LLM inference systems.`,
	// Functional title: it describes the actual scope (33 reports, four squads).
	// Deloitte's internal HR title is simply "Manager" — the Deloitte rank, with
	// no discipline attached (confirmed 2026-08-22). It is disclosed on
	// application forms and background checks, not here.
	title: `${positionById("deloitte").title}, ${positionById("deloitte").company}`,
	location: identity.location.site,
	email: identity.email,
	linkedin: identity.linkedin.url,
	github: identity.github.url,
	resumeHref: "/resume.pdf",
	resumeFileName: "akaiserauer_resume.pdf",
} as const;

export const about: readonly string[] = [
	`I build and lead platform engineering organizations. Today I run a ${metrics.orgSize}-person Platform Engineering org at Deloitte, ${metrics.squads} squads with dedicated tech leads and product owners, where I treat the internal developer platform as a product serving thousands of engineers across the US Member Firm.`,
	"Outside work I build agent infrastructure hands-on, in TypeScript and Python: multi-agent systems behind approval gates and cost controls, LLM inference serving and performance engineering down to a custom CUDA kernel, and a published design system. The problems I find most interesting are the ones that decide what an agent is allowed to do on your behalf — permissioning, guardrails, and spend — and where those decisions get enforced.",
	"I'm targeting engineering and AI-infrastructure roles — leadership or senior individual contributor — remote, or the Detroit metro area.",
];

export interface Role {
	company: string;
	title: string;
	period: string;
	highlights: readonly string[];
}

/**
 * How the site groups the canonical positions. The resume lists every position
 * separately, because a resume is a record; the site collapses the two
 * six-to-twelve-month GE roles into one entry, because a timeline with a
 * two-line stub in it reads as noise. Grouping is a PRESENTATION choice and
 * lives here — the dates, titles and bullets themselves do not.
 */
const SITE_ROLE_GROUPS: readonly {
	company: string;
	/** Only needed when a group spans more than one position. */
	title?: string;
	positionIds: readonly string[];
}[] = [
	{ company: "Deloitte", positionIds: ["deloitte"] },
	{ company: "GE Aviation", positionIds: ["ge-aviation"] },
	{
		company: "GE Digital / GE Healthcare",
		title: "Cloud Automation & Enterprise Application Engineering",
		positionIds: ["ge-digital", "ge-healthcare"],
	},
];

export const roles: readonly Role[] = SITE_ROLE_GROUPS.map((group) => {
	const grouped = group.positionIds.map(positionById);
	const first = grouped[0];
	if (!first) throw new Error(`Site role group "${group.company}" names no positions`);
	return {
		company: group.company,
		title: group.title ?? first.title,
		period: formatSitePeriod(grouped),
		highlights: grouped.flatMap((position) =>
			position.bullets.filter((bullet) => bullet.onSite).map((bullet) => bullet.text),
		),
	};
});

export interface ProjectLink {
	url: string;
	label: string;
	/** Same-origin route — rendered in-tab, without the external-link icon. */
	internal?: boolean;
}

export interface Project {
	name: string;
	description: string;
	tech: readonly string[];
	/**
	 * Public links for the project — a generated/demo site, a live app, a
	 * published package, and/or the public code repo. Omit while the repo is
	 * still private and nothing public exists yet; the card shows a
	 * "Coming soon" marker instead.
	 */
	links?: readonly ProjectLink[];
	/**
	 * Shown alongside the links when the code itself stays private, so a
	 * closed repo reads as a deliberate choice rather than an empty card.
	 */
	note?: string;
	/** AI-infrastructure projects get visual prominence in the grid. */
	aiInfra?: boolean;
}

export const projects: readonly Project[] = [
	{
		name: "ops-triage-agent",
		description:
			"An enterprise agentic system that triages an IT/Ops queue end to end: retrieves context, drafts grounded responses, and takes guarded actions behind human-approval gates, with RBAC, a hash-chained audit trail, and every release gated by an evaluation harness.",
		tech: ["Python", "FastAPI", "React", "TypeScript", "MCP"],
		links: [
			{
				url: "https://github.com/kornsour/ops-triage-agent",
				label: "View code",
			},
		],
		aiInfra: true,
	},
	{
		name: "career-manager",
		description:
			"An agentic platform that runs a job search: a dozen specialized agents behind a single autonomy gate that routes every side-effectful action to execute-now or a human approval inbox, with versioned agent memory, cross-provider model fallback, and per-day token budgets enforced before spend.",
		tech: ["TypeScript", "Next.js", "Postgres", "Drizzle", "LLM SDKs"],
		links: [
			{
				url: "/writing/agent-guardrails",
				label: "Read the architecture",
				internal: true,
			},
		],
		note: "Private repo — live walkthrough on request",
		aiInfra: true,
	},
	{
		name: "inference-platform",
		description:
			"A platform for LLM inference serving: GPU scheduling, high-throughput serving with vLLM and KServe, and inference-aware autoscaling with KEDA on Kubernetes, with observability and cost/SLO discipline built in.",
		tech: ["Python", "Kubernetes", "KServe", "KEDA", "Envoy AI Gateway"],
		links: [
			{
				url: "https://kornsour.github.io/inference-platform/",
				label: "View site",
			},
			{
				url: "https://github.com/kornsour/inference-platform",
				label: "View code",
			},
		],
		aiInfra: true,
	},
	{
		name: "llm-inference-performance",
		description:
			"Inference performance engineering end to end: a device-aware benchmark harness (p50/p95 latency, tokens/sec, peak memory), measured KV-cache, batching, and int8-quantization optimizations, tensor-parallel serving, and a custom fused-RMSNorm CUDA kernel.",
		tech: ["Python", "PyTorch", "CUDA"],
		links: [
			{
				url: "https://github.com/kornsour/llm-inference-performance",
				label: "View code",
			},
		],
		aiInfra: true,
	},
	{
		name: "micro-ceo",
		description:
			"An AI orchestrator that simulates a company hierarchy of LLM agents (CTO, VP Eng, engineers) that communicate, produce artifacts, and escalate decisions to the user.",
		tech: ["TypeScript", "Node.js", "LLM SDKs"],
		// Repo isn't ready to show yet — omit links so the card renders "Coming soon".
	},
	{
		name: "design-system",
		description:
			"A published React + Tailwind v4 component library (@kornorg/design-system): neutral zinc surfaces, indigo accent, light and dark mode, distributed as an installable npm package.",
		tech: ["TypeScript", "React", "Tailwind", "tsup"],
		links: [
			{
				url: "https://www.npmjs.com/package/@kornorg/design-system",
				label: "View on npm",
			},
			{
				url: "https://github.com/kornsour/design-system",
				label: "View code",
			},
		],
	},
	{
		name: "deCuisine",
		description:
			"A full meal-planning and grocery SaaS: recipe discovery, weekly planner, auto-generated grocery lists, a Pro-gated Kroger API integration (OAuth, cart write, AES-GCM-encrypted refresh tokens), and Stripe billing in live mode with server-enforced entitlement.",
		tech: ["Next.js", "Prisma", "Postgres", "Stripe"],
		links: [{ url: "https://decuisine.com", label: "Live site" }],
	},
	{
		name: "cohabuild",
		description:
			"A coordination platform for construction: one shared source of truth for the GC, owner, and subcontractors, with a gate-then-cascade pipeline — deterministic gate, Haiku screen, schema-constrained Sonnet analysis — that flags cross-trade conflicts with cited evidence and per-project cost budgets.",
		tech: ["Next.js", "Drizzle", "Postgres", "Stripe", "AWS Lambda", "Cloudflare"],
		links: [{ url: "https://cohabuild.com", label: "Live site" }],
	},
	{
		name: "empaca",
		description:
			"A trip packing-list app: build lists by category, share a trip with travel companions, reuse favorite templates, and let an AI assistant do the busywork.",
		tech: ["Next.js", "Drizzle", "Postgres", "better-auth", "AWS Lambda", "Cloudflare"],
		links: [{ url: "https://empaca.uresu.app", label: "Live site" }],
	},
];

export const alsoBuilt: readonly { name: string; description: string }[] = [
	{
		name: "graham-crackers",
		description: "Graham-style value-investing analysis tool",
	},
	{
		name: "audiobook-generator",
		description: "local TTS EPUB-to-M4B pipeline",
	},
	{ name: "macos-media-scanner", description: "Photos-library cleanup CLI" },
];

export interface SkillGroup {
	title: string;
	skills: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
	{
		title: "Engineering Leadership",
		skills: [
			"Building & scaling platform orgs",
			`People management (${metrics.orgSize} reports)`,
			"Product & roadmap ownership",
			"Agile / SAFe",
			"Executive communication",
		],
	},
	{
		title: "Cloud & Platform",
		skills: [
			"Kubernetes / EKS",
			"GitOps (ArgoCD)",
			"Terraform / IaC",
			"Docker",
			"AWS",
			"Prometheus / Grafana / Loki",
			"SRE / SLOs",
			"CI/CD",
			"GitHub Actions",
		],
	},
	{
		title: "Identity & Security",
		skills: [
			"IAM & authorization design",
			"SCIM",
			"OAuth / OIDC",
			"Policy enforcement & governance",
		],
	},
	{
		title: "Software Engineering",
		skills: [
			"Python",
			"FastAPI",
			"Microservices",
			"TypeScript",
			"React",
			"Next.js",
			"Tailwind",
			"Drizzle / Postgres",
		],
	},
	{
		title: "AI Engineering",
		skills: [
			"LLM applications & agentic systems",
			"LLM inference serving & performance",
			"Evaluation harnesses",
			"MCP",
			"Enterprise AI enablement (Copilot rollout)",
		],
	},
];

export const nav = [
	{ label: "About", href: "#about" },
	{ label: "Experience", href: "#experience" },
	{ label: "Projects", href: "#projects" },
	{ label: "Skills", href: "#skills" },
	{ label: "Contact", href: "#contact" },
] as const;
