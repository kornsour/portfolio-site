import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const title = "Where to put the guardrails on an agent that acts for you";
const description =
	"Design notes from an agentic platform: why autonomy is enforced at one choke point, why the kill switch sits below the gate, and why a spend cap should reuse the cancellation path.";

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: "/writing/agent-guardrails" },
	openGraph: {
		type: "article",
		url: "/writing/agent-guardrails",
		title,
		description,
	},
};

/** Body copy shares one measure and rhythm; headings break the argument into decisions. */
const p = "leading-relaxed text-zinc-700 dark:text-zinc-300";
const h2 = "mt-14 mb-4 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white";
const tradeoff =
	"mt-4 border-l-2 border-spartan-300 pl-4 text-sm leading-relaxed text-zinc-600 dark:border-spartan-800 dark:text-zinc-400";

export default function AgentGuardrails() {
	return (
		<div id="top">
			<SiteHeader />
			<main id="main" className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
				<article>
					<header>
						<p className="text-sm font-semibold uppercase tracking-widest text-spartan-600 dark:text-spartan-400">
							Design notes
						</p>
						<h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
							{title}
						</h1>
						<p className={`mt-6 text-lg ${p}`}>
							I built an agentic platform that runs my job search — a dozen specialized agents that
							source roles, score fit, tailor documents, and draft outreach. The model calls turned
							out to be the easy part. The design work was deciding what the agents may do without
							asking me, and then choosing where in the system that decision gets enforced.
						</p>
						<p className={`mt-4 ${p}`}>
							These are the four calls I'd defend in a review. The code is private; the reasoning
							isn't.
						</p>
					</header>

					<h2 className={h2}>1. One gate, not a check in every agent</h2>
					<p className={p}>
						Autonomy is a per-action-type setting — score a role, draft an email, submit an
						application — and every side-effectful action in the system funnels through a single
						gate. The gate reads the setting and either executes now or parks the action in an
						approvals inbox. Agents never decide their own permissions; they request, and something
						else adjudicates.
					</p>
					<p className={`mt-4 ${p}`}>
						The part that matters most is what happens on approval: clicking approve runs the{" "}
						<em>same executor</em> with the same serialized payload the agent originally proposed.
						The supervised path and the autonomous path are the same code path. If they were
						separate implementations, they would drift, and the supervised one — exercised less —
						would be the one that rots.
					</p>
					<p className={tradeoff}>
						<strong>Tradeoff:</strong> a single funnel is a bottleneck, and every new capability has
						to be expressed as an action type rather than just doing the thing. That friction is the
						feature. The alternative — each agent checking for itself — makes the safety property
						only as strong as the least careful agent I write at 11pm.
					</p>

					<h2 className={h2}>2. The kill switch belongs below the gate, not at it</h2>
					<p className={p}>
						Anything that leaves on my behalf is additionally gated on a global outbound switch, off
						by default. The instinct is to check that switch at the gate, next to the autonomy
						logic, where it reads nicely. That's wrong, and it took a near-miss to see why.
					</p>
					<p className={`mt-4 ${p}`}>
						The gate is one entry point among several. An autonomous run reaches the executor
						through it, but so does an approval click, an API call, and the CLI. A check at the gate
						protects the gate's callers. A check inside the executor protects everything, including
						the entry point I add six months from now and forget to wire up.
					</p>
					<p className={tradeoff}>
						<strong>Tradeoff:</strong> enforcing late means the system can do real work — compose
						the message, resolve the recipient — before discovering it isn't allowed to send. That's
						wasted compute, and I accepted it deliberately: an unwanted send is unrecoverable, and
						wasted work is merely annoying. When the two costs are that asymmetric, optimize against
						the unrecoverable one.
					</p>

					<h2 className={h2}>3. A spend cap should reuse the cancellation path</h2>
					<p className={p}>
						Pointing a batch agent at a personal model subscription makes one click potentially
						expensive, so billed calls are metered per day against a cap, checked immediately before
						each call — the budget refuses the <em>next</em> call rather than interrupting one in
						flight.
					</p>
					<p className={`mt-4 ${p}`}>
						The decision I like is that exceeding the budget raises the same class of error as a
						human pressing Stop. Both mean the same thing: end the run cleanly, keep everything
						already finished, record why it stopped. Because looping agents already knew how to
						unwind a stop correctly, the budget inherited that behavior for free instead of growing
						its own half-tested unwind logic and a new family of partial-failure bugs.
					</p>
					<p className={tradeoff}>
						<strong>Tradeoff:</strong> it couples two concepts that aren't obviously related, and a
						reader has to learn that a budget error <em>is</em> a stop. It earns that by deleting an
						entire category of bug rather than deferring it.
					</p>

					<h2 className={h2}>4. Memory is a versioned library, not a conversation</h2>
					<p className={p}>
						Agent knowledge lives in a typed, versioned store that every agent loads before it acts,
						rather than in accumulated conversation history. A dedicated curator agent proposes
						additions, and its proposals arrive marked as inferred — they need approval before they
						become something the other agents treat as true.
					</p>
					<p className={`mt-4 ${p}`}>
						Conversation memory dies with the session, can't be audited, and can't be shared across
						surfaces. This system is driven from a web UI, a CLI, and external agents; all three
						need the same picture of what's true, and I need to be able to ask why an agent believed
						something and get an answer with a version history attached.
					</p>
					<p className={tradeoff}>
						<strong>Tradeoff:</strong> considerably more machinery than putting history in the
						prompt, and the curator adds a review queue I have to actually work. It pays for itself
						the first time an agent confidently acts on something wrong and you need to find where
						that belief entered the system.
					</p>

					<h2 className={h2}>The through-line</h2>
					<p className={p}>
						Every one of these is the same question in a different costume: given an invariant I
						actually care about, what is the lowest point in the system that all callers must pass
						through, and is the invariant enforced there? Enforcing high up reads better and reviews
						faster. Enforcing at the choke point is what survives the next entry point, the next
						agent, and the next version of me who has forgotten the rule exists.
					</p>
					<p className={`mt-4 ${p}`}>
						The related lesson is that a fallback chain should end somewhere free. When a provider
						is exhausted the system hops to a different subscription, then to configured
						alternatives, and finally to a local model — so an unattended overnight run degrades to
						a weaker answer instead of producing nothing. What makes that honest rather than sloppy
						is provenance: every result records the model that actually produced it, so a role
						scored by the local fallback is visibly different from one scored by the primary.
						Degradation is fine. Silent degradation is not.
					</p>

					<footer className="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
						<p className={`text-sm ${p}`}>
							The repository is private, but I'm happy to walk through the system live — the
							approvals inbox and the budget behavior are more convincing in motion than on a page.
						</p>
						<Link
							href="/#projects"
							className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-spartan-600 transition-colors hover:text-spartan-700 dark:text-spartan-400 dark:hover:text-spartan-300"
						>
							← Back to projects
						</Link>
					</footer>
				</article>
			</main>
			<SiteFooter />
		</div>
	);
}
