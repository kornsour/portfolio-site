#!/usr/bin/env bash
#
# Everything this repo's real CI runs against it — Biome, tsc, Vitest, the
# static-export build, lockfile integrity, and Semgrep — run locally, on
# demand, so you can get CI's answer before CI does.
#
# RUN IT BY HAND. It is not wired into any git hook. It used to run from
# scripts/hooks/pre-push, back when GitHub Actions minutes were exhausted and
# this script was the only thing checking a push. CI runs again now (this
# repo is public, so its jobs run on GitHub-hosted runners at no cost), every
# change reaches main through a pull request, and the same checks run there —
# so the hook now only guards main and scans for secrets. See
# docs/adr/0020-slim-pre-push-hook.md.
#
# WHAT GOVERNS THIS REPO'S `main` (verified with `gh api` on 2026-09-13, not
# assumed):
#   - Repository ruleset 18642487 (`gh api
#     repos/kornsour/portfolio-site/rulesets/18642487`): `pull_request`,
#     `deletion`, and `non_fast_forward` rules, with an EMPTY bypass_actors
#     list — no one, the owner included, pushes straight to or deletes main.
#   - Classic branch protection (`gh api
#     repos/kornsour/portfolio-site/branches/main/protection`): strict
#     required status checks `ci / Lint & format (Biome)`, `ci / Type check`,
#     `ci / Unit tests (Vitest)`, `ci / Build`, `lockfile / integrity`.
#     Semgrep runs in CI but is not required.
#
# What each check below mirrors (see .github/workflows/ci.yml, which calls
# kornsour/gh-automation/.github/workflows/ci.yml (pinned to a SHA) with
# `migration-check: false`, plus this repo's own .github/workflows/lockfile.yml
# — all read directly, not guessed at; the reusable workflow itself is cloned
# locally at ~/Documents/GitHub/kornsour/gh-automation/.github/workflows/ci.yml):
#
#   CI job                     | Local equivalent
#   -------------------------------------------------------------------------
#   ci / Lint & format (Biome) | pnpm check
#   ci / Type check            | pnpm exec tsc --noEmit
#   ci / Unit tests (Vitest)   | pnpm test
#   ci / Build                 | pnpm build
#   lockfile / integrity       | scripts/check-lockfile.sh
#   ci / Security scan         | scripts/check-semgrep.sh — SKIPS loudly if
#   (Semgrep)                    semgrep isn't installed; not a required
#                                 status check on this repo's branch
#                                 protection, but a
#                                 real CI job (security-scan defaults to true
#                                 and this repo's ci.yml caller doesn't
#                                 override it) — included so verify.sh
#                                 doesn't silently skip something CI actually
#                                 runs.
#
# NO DB MIGRATION CHECK, DELIBERATELY: this repo is `next.config.ts`'s
# `output: "export"` — a fully static export with no server runtime and no
# database (confirmed: no `src/db/`, no `drizzle/`, no `schema.ts` anywhere
# in the tree; this repo's own ci.yml calls the shared workflow with
# `migration-check: false`, and its required-checks list has no "DB migration
# check" entry). Forcing a schema-migration guard onto a repo with no schema
# would be inventing a check CI never asked for — the opposite mistake from
# silently dropping one CI does run.
#
# CONCURRENCY: every check below runs independently of the others — no
# shared state. `pnpm build` (a static `next build`) writes to `out/` and
# `.next/`, which nothing else here reads or writes; Biome, tsc, vitest, the
# lockfile check and semgrep touch no shared state either. So all of them are
# launched at once and this script waits on the slowest one, rather than
# paying every check's time added together.
#
# EXIT-CODE CONVENTION for the one check that can legitimately be unavailable
# (semgrep): 0 = pass, 1 = fail (blocking), 3 = skip (loud, non-blocking — a
# missing prerequisite, not a broken repo). Every other check has no skip
# state: any nonzero exit is a failure.
#
# Usage:
#   pnpm verify
#   bash scripts/verify.sh
#
set -uo pipefail   # deliberately NOT -e: one check failing must not stop the rest

REPO="$(git rev-parse --show-toplevel)"
cd "$REPO"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

START_ALL=$(date +%s)

# Parallel arrays: NAMES[i] / CMDS[i] / SKIPPABLE[i] describe a check;
# PIDS[i] / STARTS[i] are filled in as each is launched.
NAMES=()
CMDS=()
SKIPPABLE=() # "1" if exit code 3 means "skipped", not "failed"

add_check() {
	NAMES+=("$1")
	CMDS+=("$2")
	SKIPPABLE+=("$3")
}

add_check "biome" "pnpm check" "0"
add_check "typecheck" "pnpm exec tsc --noEmit" "0"
add_check "test" "pnpm test" "0"
add_check "build" "pnpm build" "0"
add_check "lockfile" "bash scripts/check-lockfile.sh" "0"
add_check "semgrep" "bash scripts/check-semgrep.sh" "1"

PIDS=()
STARTS=()

echo "Running ${#NAMES[@]} checks concurrently…"
echo

for i in "${!NAMES[@]}"; do
	name="${NAMES[$i]}"
	log="$WORKDIR/$name.log"
	STARTS[$i]=$(date +%s)
	# shellcheck disable=SC2086
	(eval "${CMDS[$i]}") >"$log" 2>&1 &
	PIDS[$i]=$!
done

# ---------------------------------------------------------------------------
# Collect results in launch order (not finish order — deterministic output).
# ---------------------------------------------------------------------------
STATUSES=()   # "pass" | "fail" | "skip"
DURATIONS=()

for i in "${!NAMES[@]}"; do
	wait "${PIDS[$i]}"
	code=$?
	end=$(date +%s)
	DURATIONS[$i]=$((end - STARTS[$i]))

	if [ "$code" -eq 0 ]; then
		STATUSES[$i]="pass"
	elif [ "${SKIPPABLE[$i]}" = "1" ] && [ "$code" -eq 3 ]; then
		STATUSES[$i]="skip"
	else
		STATUSES[$i]="fail"
	fi
done

END_ALL=$(date +%s)
TOTAL=$((END_ALL - START_ALL))

# ---------------------------------------------------------------------------
# Report: someone staring at a red result should not have to read this
# script — every failing check names the exact command to reproduce it alone.
# ---------------------------------------------------------------------------
echo "───────────────────────────────────────────────────────────────────────"
FAILED=0
SKIPPED=0
for i in "${!NAMES[@]}"; do
	name="${NAMES[$i]}"
	status="${STATUSES[$i]}"
	dur="${DURATIONS[$i]}s"
	log="$WORKDIR/$name.log"
	case "$status" in
	pass)
		printf '✓ %-20s %s\n' "$name" "($dur)"
		;;
	skip)
		SKIPPED=$((SKIPPED + 1))
		printf '⚠ %-20s %s — SKIPPED (see log below)\n' "$name" "($dur)"
		sed 's/^/    /' "$log"
		;;
	fail)
		FAILED=$((FAILED + 1))
		printf '✗ %-20s %s — FAILED. Reproduce with: %s\n' "$name" "($dur)" "${CMDS[$i]}"
		echo "  ── last 20 lines of output ──"
		tail -20 "$log" | sed 's/^/    /'
		;;
	esac
done
echo "───────────────────────────────────────────────────────────────────────"

if [ "$FAILED" -gt 0 ]; then
	echo "❌ verify FAILED: ${FAILED} check(s) failed, ${SKIPPED} skipped, total ${TOTAL}s."
	exit 1
fi

if [ "$SKIPPED" -gt 0 ]; then
	echo "✅ verify passed (${SKIPPED} check(s) SKIPPED — not the same as passing; see above), total ${TOTAL}s."
	echo "   Full parity needs: pip install --disable-pip-version-check semgrep==1.172.0"
	exit 0
fi

echo "✅ verify passed: all ${#NAMES[@]} checks, total ${TOTAL}s."
