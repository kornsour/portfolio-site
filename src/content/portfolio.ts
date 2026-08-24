/**
 * All site content lives here. Edit this file — not the components — to update
 * the bio, experience, projects, or skills.
 */

export const person = {
	name: "Andrew Kaiserauer",
	headline: "Engineering and platform leader who builds the systems other engineers build on",
	valueProp:
		"I run a 33-person Platform Engineering org at Deloitte and build AI infrastructure hands-on, from multi-tenant Kubernetes platforms to LLM inference systems.",
	// Functional title: it describes the actual scope (33 reports, four squads).
	// Deloitte's internal HR title is "Lead Infrastructure Engineer II" and is
	// disclosed on application forms and background checks, not here.
	title: "Engineering Manager, Platform Engineering, Deloitte",
	location: "Detroit metro area & remote",
	email: "ajkaiserauer@gmail.com",
	linkedin: "https://www.linkedin.com/in/aj-kaiserauer/",
	github: "https://github.com/kornsour",
	resumeHref: "/resume.pdf",
	resumeFileName: "akaiserauer_resume.pdf",
} as const;

export const about: readonly string[] = [
	"I build and lead platform engineering organizations. Today I run a 33-person Platform Engineering org at Deloitte, four squads with dedicated tech leads and product owners, where I treat the internal developer platform as a product serving thousands of engineers across the US Member Firm.",
	"Outside work I build agent infrastructure hands-on, in TypeScript and Python: multi-agent systems behind approval gates and cost controls, LLM inference serving and performance engineering down to a custom CUDA kernel, and a published design system. The problems I find most interesting are the ones that decide what an agent is allowed to do on your behalf — permissioning, guardrails, and spend — and where those decisions get enforced.",
	"I'm targeting engineering management roles in platform engineering and AI infrastructure — remote, or the Detroit metro area.",
];

export interface Role {
	company: string;
	title: string;
	period: string;
	highlights: readonly string[];
}

export const roles: readonly Role[] = [
	{
		company: "Deloitte",
		title: "Engineering Manager, Platform Engineering",
		period: "2021 – Present",
		highlights: [
			"Built and lead a four-squad Platform Engineering organization of 33 engineers, wearing the product-owner, engineering-manager, and lead-architect hats across all four squads.",
			"Run a shared multi-tenant Kubernetes platform — an internal Vercel for every team in the department — serving 40+ microservices at roughly 99.95% uptime.",
			"Standardized CI/CD and container delivery across 15 teams with golden images and GitOps (ArgoCD) — deployments went from hours to minutes and incidents fell about 30%.",
			"Built an automated platform-provisioning framework: SCIM-driven access to developer tooling, a policy-enforcement engine with SOX-ready audit trails, adoption analytics, and the frontend squad that fronts it.",
			"Own platform tooling and support across GitHub, Claude, Docker, and Postman for thousands of engineers firm-wide.",
			"Led adoption of Backstage for 50+ services, cutting onboarding from weeks to days.",
			"Led the enterprise rollout of GitHub Copilot and agentic development workflows.",
		],
	},
	{
		company: "GE Aviation",
		title: "Senior Infrastructure Architect",
		period: "2018 – 2020",
		highlights: [
			"Delivered 25+ cloud migrations and new builds, generating about $1.9M in infrastructure cost savings.",
			"Built self-service AWS observability and native CI/CD that cut deployment time from an hour to two minutes.",
		],
	},
	{
		company: "GE Digital / GE Healthcare",
		title: "Cloud Automation & Enterprise Application Engineering",
		period: "2015 – 2018",
		highlights: [
			"Built cloud automation bots and cookbooks, cost-optimization tooling, and led Agile delivery.",
		],
	},
];

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
			"A full meal-planning and grocery SaaS: recipe discovery, weekly planner, auto-generated grocery lists, grocery-store integration, and subscription billing.",
		tech: ["Next.js", "Prisma", "Postgres", "Stripe"],
		links: [{ url: "https://decuisine.com", label: "Live site" }],
	},
	{
		name: "cohabuild",
		description:
			"A coordination platform for construction: one shared source of truth for the GC, owner, and subcontractors, with an AI layer that flags cross-trade conflicts before they become rework.",
		tech: ["Next.js", "Vercel"],
		links: [{ url: "https://cohabuild.vercel.app", label: "Live site" }],
	},
	{
		name: "empaca",
		description:
			"A trip packing-list app: build lists by category, share a trip with travel companions, reuse favorite templates, and let an AI assistant do the busywork.",
		tech: ["Next.js", "Vercel"],
		links: [{ url: "https://empaca.app", label: "Live site" }],
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
			"People management (33 reports)",
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
