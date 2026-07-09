/**
 * All site content lives here. Edit this file — not the components — to update
 * the bio, experience, projects, or skills.
 */

export const person = {
	name: "Andrew Kaiserauer",
	headline: "Engineering and platform leader who builds the systems other engineers build on",
	valueProp:
		"I run a 33-person Platform Engineering org at Deloitte and build AI infrastructure hands-on, from multi-tenant Kubernetes platforms to LLM inference systems.",
	title: "Manager, Platform Engineering, Deloitte",
	location: "Detroit metro area & remote",
	email: "ajkaiserauer@gmail.com",
	linkedin: "https://www.linkedin.com/in/aj-kaiserauer/",
	github: "https://github.com/kornsour",
	resumeHref: "/resume.pdf",
} as const;

export const about: readonly string[] = [
	"I build and lead platform engineering organizations. Today I run a 33-person Platform Engineering org at Deloitte, four squads with dedicated tech leads and product owners, where I treat the internal developer platform as a product serving thousands of engineers across the US Member Firm.",
	"Outside work I build extensively in TypeScript and Python, including a growing body of AI infrastructure and agentic-system projects: LLM inference serving and performance engineering, enterprise agentic workflows, and a published design system.",
	"I'm targeting senior roles in engineering management, platform engineering, AI forward-deployed and inference platform, and cloud and solutions architecture.",
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
		title: "Manager, Platform Engineering",
		period: "2021 – Present",
		highlights: [
			"Built the Platform Engineering organization from scratch: four squads with dedicated tech leads, serving thousands of engineers across the US Member Firm.",
			"Architected a multi-tenant Amazon EKS platform running 40+ microservices at roughly 99.95% uptime.",
			"Standardized CI/CD and container delivery across 15 teams with golden images and GitOps (ArgoCD) — deployments went from hours to minutes and incidents fell about 30%.",
			"Led adoption of Backstage for 50+ services, cutting onboarding from weeks to days.",
			"Designed an internal platform product built on SCIM provisioning, a shared authorization service, and a policy-enforcement engine with SOX-ready audit trails.",
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
	/** AI-infrastructure projects get visual prominence in the grid. */
	aiInfra?: boolean;
}

export const projects: readonly Project[] = [
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
		name: "ops-triage-agent",
		description:
			"An enterprise agentic system that triages an IT/Ops queue end to end: retrieves context, drafts grounded responses, and takes guarded actions behind human-approval gates, with every release gated by an evaluation harness.",
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
