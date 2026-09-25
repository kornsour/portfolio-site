/**
 * Research papers. Each paper gets a readable page at /research/<slug> and its
 * full PDF under public/research/ — a page is what a phone and a search engine
 * can read; the PDF is the version of record.
 *
 * The prose below is condensed from the papers themselves, which live in
 * Andrew's Drive (Projects/Experiments/AI Cost Reduction) and are copied into
 * public/research/ unchanged. Every number here appears in the PDF it
 * summarizes. When a paper is revised, replace the PDF and update this file
 * from it — never the other way round, and never add a finding the PDF does
 * not state.
 */

export type Block =
	| { type: "p"; text: string }
	| { type: "list"; ordered?: boolean; items: readonly ListItem[] }
	| {
			type: "table";
			caption: string;
			columns: readonly string[];
			rows: readonly (readonly string[])[];
			note?: string;
	  }
	| { type: "figure"; figure: FigureId; caption: string }
	| { type: "callout"; title: string; text: string };

/** A list item may open with a bold lead-in, the way the papers write them. */
export interface ListItem {
	lead?: string;
	text: string;
}

export interface PaperSection {
	/** Anchor id, unique within a paper. */
	id: string;
	heading: string;
	blocks: readonly Block[];
}

export interface Stat {
	value: string;
	label: string;
}

export type PaperStatus =
	/** Final results. */
	| "published"
	/** A protocol or draft that makes predictions, not findings. Rendered with a draft banner. */
	| "draft";

export interface Paper {
	slug: string;
	/** Eyebrow above the title: what kind of document this is. */
	kind: string;
	title: string;
	subtitle: string;
	status: PaperStatus;
	/** Version line exactly as the PDF states it. */
	version: string;
	/** Month shown to readers. */
	date: string;
	/** ISO date for metadata and JSON-LD. */
	isoDate: string;
	/** Shown in the draft banner, and on the index card, for a draft. */
	statusNote?: string;
	/** One or two sentences for the index card and the meta description. */
	summary: string;
	stats: readonly Stat[];
	lede: readonly string[];
	sections: readonly PaperSection[];
	pdf: { href: string; fileName: string; pages: number };
	/** Public code and data behind the paper. */
	repo: string;
	/** Slug of a related paper on this site. */
	companion?: string;
}

/** The index page's heading and intro, also used as its meta description. */
// Deliberately topic-neutral: the section is for any research, not one field.
// What a particular study is about belongs in that paper's own `summary`.
export const researchHeading = "Papers and experiments";
export const researchIntro =
	"Independent research I run and write up. Each paper has a readable summary here and the full PDF to download.";

// ─── Figures ──────────────────────────────────────────────────────────────
// The white paper's three charts, redrawn as SVG from the numbers in its own
// tables so they read in both themes. Data here; drawing in
// components/research/figures.tsx.

export type FigureId = "cost-vs-pass" | "cost-by-token-type" | "price-vs-task-cost";

/** Figure 1: cost per completed task (USD) against pass rate (%). */
export const costVsPass: readonly {
	policy: string;
	cost: number;
	pass: number;
	/** The dominant policy is drawn filled. */
	highlight?: boolean;
}[] = [
	{ policy: "Always Sonnet", cost: 0.099, pass: 100, highlight: true },
	{ policy: "Parent picks (C1_inline)", cost: 0.129, pass: 100 },
	{ policy: "Always Haiku", cost: 0.239, pass: 84 },
	{ policy: "Always Opus (B, the default)", cost: 0.528, pass: 99 },
];
export const oracleCost = 0.098;

/**
 * Figure 2: mean worker-session cost by token type (USD). Segment values are
 * the paper's token counts × its list prices; they sum to the session costs
 * in its per-session table ($0.099, $0.201, $0.526).
 */
export const costByTokenType: readonly {
	model: string;
	detail: string;
	cacheReads: number;
	cacheWrites: number;
	output: number;
	total: number;
}[] = [
	{
		model: "Claude Sonnet 5",
		detail: "7.4 turns · 138k tokens re-read",
		cacheReads: 0.028,
		cacheWrites: 0.043,
		output: 0.028,
		total: 0.099,
	},
	{
		model: "Claude Haiku 4.5",
		detail: "26.3 turns · 950k tokens re-read",
		cacheReads: 0.095,
		cacheWrites: 0.048,
		output: 0.058,
		total: 0.201,
	},
	{
		model: "Claude Opus 5",
		detail: "14.6 turns · 380k tokens re-read",
		cacheReads: 0.19,
		cacheWrites: 0.164,
		output: 0.172,
		total: 0.526,
	},
];

/** Figure 3: per-token list price and cost per completed task, relative to Sonnet 5. */
export const priceVsTaskCost: readonly { model: string; price: number; task: number }[] = [
	{ model: "Claude Haiku 4.5", price: 0.5, task: 2.4 },
	{ model: "Claude Sonnet 5", price: 1, task: 1 },
	{ model: "Claude Opus 5", price: 2.5, task: 5.3 },
];

// ─── Papers ───────────────────────────────────────────────────────────────

const REPO = "https://github.com/kornsour/model-routing";

const modelRouting: Paper = {
	slug: "model-routing",
	kind: "White paper · Model routing in agentic coding",
	title: "Cheapest per token is not cheapest per task",
	subtitle:
		"A pre-registered test of model routing for agent handoffs on Claude models, and what the wider research says about why routing pays off less than its price list suggests.",
	status: "published",
	version: "Version 1.0 (confirmatory stage 1 results)",
	date: "September 2026",
	isoDate: "2026-09-25",
	summary:
		"A pre-registered experiment on 780 graded agent sessions. Letting the parent pick the worker model cut cost per completed task 76% against always-Opus, but a fixed always-Sonnet default beat the router by another 23%, and the cheapest model per token cost 2.4× Sonnet per task.",
	stats: [
		{
			value: "76%",
			label:
				"lower cost per completed task when the parent picks the worker model, versus defaulting to Opus",
		},
		{
			value: "23%",
			label:
				"cheaper again: a fixed “always Sonnet” default beat the router, at the same 100% completion",
		},
		{
			value: "2.4×",
			label: "Haiku’s cost per completed task versus Sonnet, despite half the per-token price",
		},
		{
			value: "1.3%",
			label:
				"the most a perfect hindsight router could have saved over always-Sonnet on this task set",
		},
	],
	lede: [
		"Model routing promises to cut AI spend by sending easy work to cheap models and hard work to expensive ones. The promise is usually argued from per-token price lists. What an organization actually pays for is completed work, and in agentic coding a task is dozens of model calls whose number depends on which model runs them.",
		"This paper reports a pre-registered experiment that measured cost per completed task for 65 coding tasks handed off from a Claude Opus session to a fresh worker agent, under four dispatch policies, three trials each, graded by hidden tests with no LLM judge. It then places the result against the published research on routers, including the commercial tools that have made routing mainstream.",
	],
	sections: [
		{
			id: "findings",
			heading: "Findings",
			blocks: [
				{
					type: "list",
					ordered: true,
					items: [
						{
							lead: "The pre-registered hypothesis held.",
							text: "Letting the parent session name the worker model while writing the handoff brief cut cost per completed task by 76% (95% CI 70% to 80%) versus spawning every worker on Opus, with no loss in completion (100% vs 99%). Billing the router’s entire turn still leaves a 50% saving.",
						},
						{
							lead: "But a fixed default did better.",
							text: "Always spawning on Sonnet completed 100% of tasks at $0.099 each, 23% below the router. The router chose Sonnet 87% of the time, and every departure from Sonnet added cost. The saving came from not defaulting to the most expensive model, not from choosing per task.",
						},
						{
							lead: "The cheapest model was not the cheapest per task.",
							text: "Haiku completed 84% of tasks at $0.239 per completed task, 2.4× Sonnet. It took 3.5× the turns and re-read 7× as much cached context, so it cost more than Sonnet even on the easy tasks it passed.",
						},
						{
							lead: "There was almost nothing left to route.",
							text: "A perfect hindsight oracle would have saved only 1.3% over always-Sonnet. No task in the set required Opus. Routing can only earn money when some tasks need the expensive model and others don’t; this workload had one clear winner.",
						},
						{
							lead: "The literature agrees once you separate settings.",
							text: "Headline router savings of 45% to 98% come from single-turn chat and QA benchmarks with a 20× or wider price gap. Independent re-evaluations find routers often fail to beat simple baselines, and the newer agentic studies find routing harder: prompt caches are per model, weaker models take more turns, and task difficulty is often invisible until the agent has explored the code.",
						},
					],
				},
				{
					type: "callout",
					title: "What to do with this",
					text: "Set the handoff default to the mid-tier model, not the parent’s model; this alone captured almost all of the available saving. Judge any router, commercial or custom, on cost per completed task against the best fixed default, not against the most expensive model. Route at clean context boundaries (new subagents, new tasks), never mid-conversation, and prefer effort control within one model over switching models when the context is warm.",
				},
			],
		},
		{
			id: "question",
			heading: "Why routing looks like free money",
			blocks: [
				{
					type: "p",
					text: "The routing pitch is arithmetic on a price list. If a frontier model costs 5× a small one and 70% of requests are easy, sending those to the small model should cut the bill by more than half. Early academic results supported this: RouteLLM reported cost reductions of over 85% on MT-Bench while keeping 95% of GPT-4’s quality, FrugalGPT reported up to 98%, and AutoMix over 50%. Commercial products followed. Agentic work breaks three assumptions behind that arithmetic.",
				},
				{
					type: "list",
					ordered: true,
					items: [
						{
							lead: "A task is many calls, and the count depends on the model.",
							text: "A coding agent reads files, runs tests, edits and re-runs. A weaker model that takes three times the turns can cost more in total even at half the per-token price.",
						},
						{
							lead: "Each call re-reads the conversation so far.",
							text: "Prompt caching makes this cheaper, but caches are per model. Switching models recomputes the entire request.",
						},
						{
							lead: "Difficulty is often invisible up front.",
							text: "A one-line bug report can hide a one-line fix or a multi-module refactor. A router reading only the prompt cannot tell which.",
						},
					],
				},
				{
					type: "p",
					text: "The natural place to route in an agent system is therefore the handoff: the moment a parent session spawns a fresh worker (a subagent, a task chip, a background job) with a written brief. The worker starts with an empty cache whatever model it runs on, the parent has just read the relevant context, and the brief is the worker’s whole input. Asking the parent to also name the model costs almost nothing. This study tests whether that cheap decision pays.",
				},
			],
		},
		{
			id: "method",
			heading: "How it was tested",
			blocks: [
				{
					type: "p",
					text: "The primary hypothesis was fixed before the confirmatory run, along with the metric, the non-inferiority margin, the policies, the trial count, the randomization seed and a hash of the task set: spawning with the model the parent recommends while it writes the brief has a lower cost per completed task than spawning with the parent’s own model, with a pass rate no more than 10 percentage points worse. The report tool marks a run confirmatory only when every registered field matches. Everything else, including the comparison against always-Sonnet, is labeled exploratory.",
				},
				{
					type: "table",
					caption: "Policies",
					columns: ["Policy", "What happens at the handoff"],
					rows: [
						[
							"B (control)",
							"Fresh worker session on the parent’s model, Claude Opus 5. The status quo for most agent harnesses.",
						],
						[
							"C1_inline (treatment)",
							"The parent writes the brief and ends with a one-line pick from a menu (Haiku, Sonnet, Opus at low effort, Opus). The worker runs on that pick with the same brief as B, so the two arms differ only in model.",
						],
						["static_sonnet", "Fresh worker on Claude Sonnet 5 for every task."],
						["static_haiku", "Fresh worker on Claude Haiku 4.5 for every task."],
						[
							"oracle",
							"Computed afterwards: for each task and trial, the cheapest static model that passed. Not deployable; it bounds what any router could save.",
						],
					],
					note: "Four policies × 65 tasks × 3 trials = 780 graded cells, run sequentially in seeded randomized blocks with a 40-turn cap per session for every model.",
				},
				{
					type: "p",
					text: "The 65 tasks live in three purpose-built Python repositories (invoicing, log processing, a notes CLI): 29 bug fixes, 13 features, 5 config, 5 performance, 4 migrations and a handful each of docs, refactor and tests. A calibration run beforehand measured difficulty instead of guessing it: 50 tasks were easy (Haiku passed every trial) and 15 medium (Haiku passed some). No task was passed only by Opus.",
				},
				{
					type: "p",
					text: "A cell passes only when the hidden tests pass, the visible tests still pass, and no file outside the task’s allowed paths changed. Grading is deterministic; there is no LLM judge. All figures are list API prices: Haiku 4.5 at $1 / $5 per million input / output tokens, Sonnet 5 at $2 / $10, Opus 5 at $5 / $25, with Claude Code writing its prompt cache at the 1-hour rate.",
				},
			],
		},
		{
			id: "results",
			heading: "Results",
			blocks: [
				{
					type: "table",
					caption: "The primary test passed by a wide margin",
					columns: [
						"Policy",
						"Pass rate (95% CI)",
						"Cost per completed task (95% CI)",
						"Mean turns",
					],
					rows: [
						["B: always Opus", "99% (98 to 100)", "$0.528 ($0.454 to $0.599)", "14.6"],
						["C1_inline: parent picks", "100% (100 to 100)", "$0.129 ($0.104 to $0.167)", "9.3"],
						["static_haiku", "84% (76 to 91)", "$0.239 ($0.200 to $0.293)", "26.3"],
						["static_sonnet", "100% (100 to 100)", "$0.099 ($0.090 to $0.109)", "7.4"],
						["oracle (hindsight)", "100%", "$0.098", "n/a"],
					],
					note: "Intervals are 95% task-clustered bootstrap (all trials of a task resampled together). 36 Haiku sessions hit the 40-turn cap and were graded on whatever state they left; no other policy had any.",
				},
				{
					type: "figure",
					figure: "cost-vs-pass",
					caption:
						"Cost per completed task against pass rate. Always-Sonnet sits almost on top of the hindsight oracle and dominates every other policy, including the router. Always-Haiku is cheaper per token and worse on both axes than Sonnet.",
				},
				{
					type: "p",
					text: "Against the Opus default, parent-picked routing saved 76% per completed task (95% CI 70% to 80%, p < 0.001) and changed the pass rate by +0.5 points, comfortably inside the 10-point margin. The router recovered 93% of the oracle’s saving over Opus. Billing the parent’s entire brief-writing turn to routing, which overstates the cost because B also needs a brief, cuts the saving to 50%.",
				},
				{
					type: "p",
					text: "The comparison readers will ask about was not pre-registered, so it is exploratory: against always-Sonnet, the router cost 30% more per completed task (95% CI +9% to +59%) at the same 100% completion. Put the other way, always-Sonnet was 23% cheaper than the router.",
				},
				{
					type: "table",
					caption: "Where the router’s picks went",
					columns: ["Router’s pick", "Share of cells", "Passed", "Mean cost per task"],
					rows: [
						["Sonnet", "87%", "169 / 169", "$0.106"],
						["Haiku", "10%", "19 / 19", "$0.062 (Sonnet: $0.055 on the same cells)"],
						["Opus", "4%", "7 / 7", "$0.848 (Sonnet passed these too)"],
					],
				},
				{
					type: "p",
					text: "The parent made sensible-looking choices: it sent the simplest tasks to Haiku and a few it judged risky to Opus. Both kinds of departure raised cost. Haiku’s “easy” wins were no cheaper than Sonnet’s, and the Opus picks bought insurance the tasks did not need. Even on easy tasks, where Haiku passed 95% of the time, it cost twice as much per completed task as Sonnet. On medium tasks it cost five times as much, because it failed half the time and burned its full turn budget doing so.",
				},
			],
		},
		{
			id: "why-cheap-cost-more",
			heading: "Why the cheapest model cost the most per task",
			blocks: [
				{
					type: "p",
					text: "The per-session token records explain the inversion. Almost none of the cost is fresh input. It is cache reads (the conversation re-read on every turn), cache writes (new context stored at the 1-hour rate), and output.",
				},
				{
					type: "figure",
					figure: "cost-by-token-type",
					caption:
						"Mean worker session cost by token type (195 sessions per model). Haiku takes 3.5× Sonnet’s turns but re-reads 6.9× the tokens, because every extra turn re-reads a longer context. Opus writes about 1.5× and outputs about 2.4× what Sonnet does, on top of a 2.5× per-token price.",
				},
				{
					type: "p",
					text: "Two effects compound. First, turn count is superlinear in cost. If each turn adds roughly the same amount of context, total re-read tokens grow with the square of the turn count, so 3.5× the turns gives about 7× the reads. A high cache hit rate does not rescue this; Haiku’s was the highest of the three at 98%. Caching makes each re-read cheap, not free. Second, the per-token price gap is small next to the per-task behavior gap.",
				},
				{
					type: "figure",
					figure: "price-vs-task-cost",
					caption:
						"Price per token versus measured cost per completed task, relative to Sonnet 5. Haiku’s half-price tokens became 2.4× the task cost. Opus’s 2.5× price became 5.3×, because it also took twice Sonnet’s turns at its default effort.",
				},
				{
					type: "p",
					text: "This also explains why a cascade (start on Haiku, escalate on failure) could not be tested properly. Its deployable checker accepted Haiku’s partially correct work, so it never escalated. When escalation was forced with the hidden tests as checker, a second problem appeared: Sonnet, inheriting Haiku’s partial edits, failed a task it passes reliably from a clean checkout. A wrong start anchors the next model.",
				},
			],
		},
		{
			id: "why-routing-helped-less",
			heading: "Why routing helped less than expected",
			blocks: [
				{
					type: "p",
					text: "The hindsight oracle beat always-Sonnet by only 1.3% ($0.0976 versus $0.0989), and a router cannot save more than the oracle. On this workload, routing’s entire upside was realized by picking one good default, and any router with imperfect judgment could only add cost. Four conditions produced that.",
				},
				{
					type: "list",
					ordered: true,
					items: [
						{
							lead: "No task needed the expensive model.",
							text: "Where Haiku failed, Sonnet almost always passed; nothing required Opus.",
						},
						{
							lead: "The cheap tier was not cheap per task.",
							text: "Haiku 4.5 was not cheaper than Sonnet on easy work, even when it passed.",
						},
						{
							lead: "The price ladder is narrow.",
							text: "RouteLLM’s 85% came from routing between GPT-4 Turbo and Mixtral 8x7B, a per-token gap of more than 20×. Claude’s current ladder spans 5× from Haiku to Opus, and only 2× between adjacent tiers. Differences in tokens per task easily swamp gaps that small.",
						},
						{
							lead: "The harness had already captured the easy wins.",
							text: "Claude Code already uses Haiku for background work and exploration subagents, lets parents set subagent models, and offers effort levels. In the author’s own transcripts, parents routed subagents to Sonnet 9 times in 10.",
						},
					],
				},
				{
					type: "callout",
					title: "Is it the models or the harness?",
					text: "Neither is a defect. The weak routing payoff follows from a narrow price ladder, a mid-tier model that happens to be the most token-efficient on this work, and an agent loop in which extra turns cost more than linearly. Training could change the second (efficient small models, effort chosen inside the model), and harness design could change the third (explore-then-route, verified cascades, cheaper cache lifetimes for short workers). Neither would help much on a workload where one model already does everything well at the lowest price.",
				},
			],
		},
		{
			id: "literature",
			heading: "What the wider research shows",
			blocks: [
				{
					type: "list",
					items: [
						{
							lead: "Headline results come from single-turn benchmarks.",
							text: "FrugalGPT, Hybrid LLM, AutoMix, RouteLLM and MixLLM measure savings per query against a much more expensive model, with a lenient quality bar (for example 95% of GPT-4) and a price gap of 20× or more.",
						},
						{
							lead: "Independent re-evaluations are less kind.",
							text: "LLMRouterBench (400,000+ instances, 33 models, 10 routers) finds several recent approaches, including commercial routers, fail to reliably outperform a simple baseline. RouterArena finds no router leading on every metric. Other work shows routers collapse to the strongest model under generous budgets, and can be pushed there by short appended text.",
						},
						{
							lead: "Agentic studies find routing harder.",
							text: "Swapping models mid-trajectory changes most later actions, so offline router evaluation on agent logs is unreliable. Prompt-only routing on software tasks has an error floor because difficulty is hidden in the repository. In one scout-then-fix study the saving held with the router removed, so it came from the handoff design, not the routing decision.",
						},
						{
							lead: "Commercial claims are mostly unmeasured.",
							text: "The only independent multi-vendor measurements found use single-turn QA. No independent study of real-world savings from Copilot Auto, Cursor Auto, Windsurf or OpenRouter Auto on agentic coding was found, and none of these tools publish cost per completed task.",
						},
					],
				},
				{
					type: "p",
					text: "Choosing among models once per task can pay when tiers genuinely differ in which tasks they can solve. Switching models within a trajectory is hard to evaluate and hard to profit from. Much of the reported gain comes from how the work is split and handed off rather than from the routing classifier. The PDF has the full comparison, with sources.",
				},
			],
		},
		{
			id: "when-routing-pays",
			heading: "When routing pays and when it does not",
			blocks: [
				{
					type: "list",
					items: [
						{
							lead: "Tends to pay when",
							text: "the per-task (not per-token) price gap between tiers is wide; a large share of traffic is clearly easy and recognizable from the request; some work genuinely needs the expensive model, so the oracle beats every fixed default by a real margin; requests start fresh; and a reliable verifier exists for cascades.",
						},
						{
							lead: "Tends not to pay when",
							text: "it switches models inside a long, cache-warm conversation; the cheap model takes more turns or fails and retries; one model is already cheapest per completed task; the harness already routes the easy wins; routers are judged against the most expensive model instead of the best fixed default; or difficulty is only visible after exploration.",
						},
					],
				},
				{
					type: "callout",
					title: "A test before buying or building a router",
					text: "Run each candidate model alone on a representative sample of real tasks, graded by outcome, and compute the oracle. If the oracle is not clearly cheaper than the best single model, no router will be either.",
				},
			],
		},
		{
			id: "limitations",
			heading: "Limitations",
			blocks: [
				{
					type: "list",
					items: [
						{
							lead: "Synthetic, well-specified tasks.",
							text: "Three small Python repositories with short, clearly scoped briefs. Harder or vaguer work may open headroom or remove it. The results speak to agentic coding handoffs, not chat or knowledge work.",
						},
						{
							lead: "No Opus-only tasks,",
							text: "so the study cannot show the case where routing to a frontier model is worth its price.",
						},
						{
							lead: "Generation mismatch.",
							text: "Haiku 4.5 is a generation older than Sonnet 5 and Opus 5; part of its penalty may be generational. Results describe the models as served on 24 and 25 September 2026.",
						},
						{
							lead: "Effort and brief quality held constant.",
							text: "Opus ran at default effort in the static arms, and every worker got the same canned brief.",
						},
						{
							lead: "Single vendor, single operator, list prices.",
							text: "Price ratios differ across vendors, so the Sonnet-versus-router gap in particular may not carry over.",
						},
						{
							lead: "The key practical comparison was exploratory.",
							text: "The always-Sonnet result was not pre-registered and should be confirmed in a registered follow-up.",
						},
					],
				},
				{
					type: "p",
					text: "Reproducibility: the confirmatory run was registered on 24 September 2026 against a hashed task set and config; the statistics use task-clustered bootstrap intervals, two-sided task-clustered permutation tests and a one-sided non-inferiority test, with Holm adjustment across secondary hypotheses. The run cost $202.33 at list price, plus $109.60 for calibration. The harness, raw data and the per-task pass/fail matrix for all 780 cells are in the repository.",
				},
			],
		},
	],
	pdf: {
		href: "/research/model-routing-white-paper-v1.0.pdf",
		fileName: "Kaiserauer_Model_Routing_White_Paper_v1.0.pdf",
		pages: 16,
	},
	repo: REPO,
	companion: "route-on-evidence",
};

const routeOnEvidence: Paper = {
	slug: "route-on-evidence",
	kind: "Hypothesis paper · Governing AI model spend",
	title: "Route on evidence, not on the prompt",
	subtitle:
		"A proposed design for keeping everyday AI work on cheaper models without blocking anyone from frontier intelligence, and a study protocol to test it against the right controls.",
	status: "draft",
	version: "Version 0.2 (protocol revised; not yet registered, not yet tested)",
	date: "September 2026",
	isoDate: "2026-09-25",
	statusNote:
		"Pre-registration draft. The study (exp06) is not yet registered and not yet run: everything below is a hypothesis and a protocol, not a finding. Published now to fix the design in public before any data exists.",
	summary:
		"A proposed escalation ladder: start every session on a mid-tier model, keep frontier intelligence one evidence-backed step away, and decide the model on what happens during the work rather than on the prompt. Includes the protocol for testing it against the best fixed default.",
	stats: [
		{
			value: "81%",
			label: "lower cost per completed task on Sonnet than Opus in exp05, at equal completion",
		},
		{
			value: "1.3%",
			label: "extra saving a perfect prompt router could have added on top of that",
		},
		{
			value: "0 / 24",
			label:
				"times Copilot Auto upgraded the model when told a task was complex, in Michelin’s audit",
		},
		{
			value: "0",
			label:
				"tasks in exp05 that only the frontier model could solve — the number this study must first change",
		},
	],
	lede: [
		"Companies are overspending on AI because people pick the most capable model for everything. Setting a cheaper default helps until users switch back, and they do. Blocking the expensive model fails the minority of tasks that need it. Asking people to choose well does not work, because they lack the time and the information.",
		"The instinctive fix is a router: a classifier that reads the prompt and picks the model. The evidence says this is the wrong place to decide. How hard a task is often cannot be seen in the prompt, off-the-shelf routers send whole topics such as coding to the strongest model, and in the one independent production audit found, a vendor router cost 6 to 18 times more than a small model that solved the same tasks.",
	],
	sections: [
		{
			id: "hypothesis",
			heading: "The hypothesis",
			blocks: [
				{
					type: "p",
					text: "Decide the model on evidence gathered while the work happens, not on the prompt before it starts. Every session starts on a mid-tier model that users cannot change. Frontier intelligence is never blocked; it is reached by climbing an escalation ladder. The first rungs keep the same model and its cache (clarify, think harder, consult a frontier advisor). The upper rungs hand the task to a frontier session when there is evidence it is needed: failing tests, no progress, a frustrated user, the advisor’s recommendation, or an explicit request with a reason. A budget guard downgrades instead of blocking.",
				},
				{
					type: "callout",
					title: "The prediction, stated against the right control",
					text: "On work where the frontier model has real headroom over the mid-tier model, the ladder recovers most of that headroom at a small fraction of always-frontier’s cost premium. On work with no headroom, the ladder costs no more than the plain mid-tier default, because it does not escalate. The companion study showed the second case. This study is designed to find the first, and to say so plainly if it cannot.",
				},
				{
					type: "p",
					text: "Three roles get separated. The user decides the task. The working model decides how much intelligence it needs, because it is the only party that sees the evidence (the code, the errors, the user’s reactions). The platform decides the budget and enforces the starting point. Most current products mix these up.",
				},
			],
		},
		{
			id: "problem",
			heading: "The problem, precisely",
			blocks: [
				{
					type: "p",
					text: "The companion study measured 65 agentic coding tasks. A fresh session on Sonnet completed 100% of them at $0.099 per completed task; the same work on Opus completed 99% at $0.528. That is an 81% saving from the default alone. A perfect hindsight router would have saved only another 1.3%. The money is in the default, and it leaks because people override it.",
				},
				{
					type: "table",
					caption: "Three approaches commonly tried, and why each fails",
					columns: ["Approach", "What happens"],
					rows: [
						[
							"Set a cheaper default",
							"Works for most people, most of the time, but the users who care most about quality (often engineers) switch back. A default a user can change is only a suggestion.",
						],
						[
							"Block the expensive model",
							"Saves money and fails the tasks that need it. People route around it with personal accounts, or lose trust in the platform.",
						],
						[
							"Show people the cost",
							"Helps a little. People do not bear the cost, and the effect fades.",
						],
					],
				},
				{
					type: "p",
					text: "That leaves automation: something the user cannot override, that still gets them the stronger model when the task truly needs it.",
				},
			],
		},
		{
			id: "why-not-prompt-router",
			heading: "Why a prompt router is the wrong automation",
			blocks: [
				{
					type: "list",
					items: [
						{
							lead: "Difficulty is invisible up front.",
							text: "Prompt-only routing on software tasks has a formal error floor, and in the companion study no task description predicted which tasks the cheap model would fail.",
						},
						{
							lead: "Routers route by topic, not difficulty.",
							text: "A standard router sent every coding and math query to the strongest model. For a company whose heavy users are engineers, that reproduces the “everyone on Opus” problem automatically.",
						},
						{
							lead: "In production, the one independent audit found the router cost more.",
							text: "Michelin audited about 700 GitHub Copilot Auto requests. On tasks a small model solved every time, Auto billed 6 to 18 times more; telling it a task was complex produced zero upgrades in 24 attempts.",
						},
						{
							lead: "Routers can be gamed.",
							text: "Short appended text reliably pushes routers to the strongest model. Internal users will find “this is critical, think very hard” within a week.",
						},
						{
							lead: "A vague prompt needs a question, not a bigger model.",
							text: "On ambiguous coding tasks, asking clarifying questions raised GPT-4’s pass rate from 70.96% to 80.80%, while a 2026 benchmark found a stronger model with extended thinking did slightly worse on ambiguous tasks.",
						},
					],
				},
			],
		},
		{
			id: "ladder",
			heading: "The design: an escalation ladder",
			blocks: [
				{
					type: "table",
					caption: "Every session starts at the top. Lower rungs cost more.",
					columns: ["Rung", "Mechanism", "Trigger", "Cache"],
					rows: [
						[
							"Start",
							"Mid-tier model, medium effort. Enforced; the user cannot change the starting model.",
							"Every session",
							"kept",
						],
						[
							"L0 Clarify",
							"Ask one to three questions before starting",
							"Request is ambiguous",
							"kept",
						],
						[
							"L1 Effort",
							"Same model, higher reasoning effort",
							"Model’s own judgment, or a classifier prior",
							"kept",
						],
						[
							"L2 Advisor",
							"Frontier model reads the transcript and returns guidance; the working model continues",
							"Model decides, plus a forced check before declaring a task done",
							"kept",
						],
						[
							"L3 Handoff",
							"New frontier session, clean checkout, with a written brief and the failure log",
							"Verifier still failing after K attempts; no progress in N turns; user says “that’s wrong”; advisor recommends it",
							"new",
						],
						[
							"L4 Request",
							"User asks for the frontier model with a one-line reason, counted against a monthly allowance",
							"Explicit",
							"new",
						],
						[
							"Budget guard",
							"Past a per-person allowance, frontier requests downgrade to the default model with a notice instead of being blocked",
							"Every rung",
							"",
						],
					],
				},
				{
					type: "p",
					text: "Routing is decided per session and kept fixed within it, because changing model mid-session breaks the prompt cache. L3 is not a mid-session switch: it is a new session, where the cache is empty regardless. Enforcement sits where the user cannot change it: managed client settings, an API gateway that pins each session to its starting model, and admin-console defaults for chat products. Every response shows a small routing receipt, for example “Sonnet · Opus consulted twice”, because silent routing destroys trust.",
				},
			],
		},
		{
			id: "hypotheses",
			heading: "What exp06 will test",
			blocks: [
				{
					type: "list",
					items: [
						{
							lead: "H0, the gate: headroom exists.",
							text: "At least 10 tasks (or 10% of the registered set) must be measured hard in calibration: the frontier model passes at least 2 of 3 trials and the mid-tier at most 1 of 3. If that fails after the task set has been extended once, the study stops and publishes “no frontier-only work found” as the result.",
						},
						{
							lead: "L1, primary: the ladder earns its cost over the best fixed default.",
							text: "On the hard stratum the ladder completes at least 10 percentage points more tasks than always-Sonnet, and its cost per completed task over the whole set is no more than 1.5× always-Sonnet’s. Both are required, so a ladder that wins by escalating everything does not pass.",
						},
						{
							lead: "L2 to L5, secondary.",
							text: "Cache-preserving rungs do most of the work, paired with measured escalation recall and precision; evidence gathered while working beats a frozen prompt classifier on cost; a handoff from a clean checkout beats one that inherits the failed attempt; clarifying first reduces handoffs on ambiguous tasks.",
						},
						{
							lead: "F1 to F3, field pilot.",
							text: "Fewer complaints than a hard block, a request path that stays rare, and spend that falls by at least what a shadow-mode log predicted, measured against a baseline taken before anything changes.",
						},
					],
				},
			],
		},
		{
			id: "protocol",
			heading: "How the protocol guards against a false positive",
			blocks: [
				{
					type: "p",
					text: "Version 0.1 stated the primary hypothesis against always-frontier. The companion study already shows always-mid-tier meets that bar with no escalation at all, so a study built on it could pass without the ladder doing anything. Version 0.2 fixes that and the other weaknesses of the exp05 process before any data exists.",
				},
				{
					type: "list",
					items: [
						{
							lead: "The control is the best fixed default,",
							text: "not the most expensive model. Always-frontier is reported as the ceiling.",
						},
						{
							lead: "Tasks are drawn before they are calibrated.",
							text: "Real handoffs are sampled at random from 562 harvested task chips, plus long multi-module work and an ambiguous stratum with a scripted answer key. Adding tasks because the mid-tier model failed them is not allowed.",
						},
						{
							lead: "Tuning and testing never share tasks.",
							text: "A seeded 30/70 split: every free parameter (K, N, the advisor and clarifying prompts, the comparison classifier) is frozen on the tuning split, and only the confirmatory split is scored.",
						},
						{
							lead: "Every escalation path must fire before registration.",
							text: "The verifier’s false-accept rate is measured first, and each escalation path must fire on a real failure in a smoke run. exp05’s cascade was registered before its escalation path had ever fired.",
						},
						{
							lead: "The margin is sized by a power calculation.",
							text: "The +10-point hard-stratum claim needs 45 to 90 hard tasks depending on discordance; v0.1’s 2-point margin would have needed 650 to 2,000 tasks, out of reach at any budget this study will have.",
						},
						{
							lead: "Deterministic grading, blinding, intention to treat.",
							text: "No LLM judge; no arm sees a task’s label; every planned cell counts once; outage handling and a budget-priority order for dropping arms are fixed up front.",
						},
					],
				},
			],
		},
		{
			id: "could-be-wrong",
			heading: "Ways this could be wrong",
			blocks: [
				{
					type: "list",
					items: [
						{
							lead: "Models may not escalate when they should.",
							text: "An overconfident mid-tier model delivers mediocre work without asking for help. The forced advisor check and the recall measurement exist so this shows up as a number rather than a suspicion.",
						},
						{
							lead: "Advisor costs may add up.",
							text: "Each advisor call rereads the full transcript at frontier prices. On long sessions, frequent consultations could cost more than a handoff.",
						},
						{
							lead: "Headroom may not exist for this class of work.",
							text: "exp05 found none. If exp06 finds none either, the practical advice is the companion study’s: set the default to the mid-tier model and stop.",
						},
						{
							lead: "The verifier may still false-accept.",
							text: "Generated tests can be wrong in the same direction as the code.",
						},
						{
							lead: "Single author, single vendor, list prices.",
							text: "The tasks are written by the person who designed the policies. The real-handoff stratum limits that, but does not remove it.",
						},
					],
				},
			],
		},
	],
	pdf: {
		href: "/research/route-on-evidence-v0.2-draft.pdf",
		fileName: "Kaiserauer_Route_on_Evidence_v0.2_DRAFT.pdf",
		pages: 19,
	},
	repo: REPO,
	companion: "model-routing",
};

/** Newest first, published before drafts. */
export const papers: readonly Paper[] = [modelRouting, routeOnEvidence];

export function paperBySlug(slug: string): Paper | undefined {
	return papers.find((paper) => paper.slug === slug);
}
