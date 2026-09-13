# ADR-0020: Pre-push guards main and scans for secrets; CI runs verify

- Status: Proposed
- Date: 2026-09-13

## Context

`scripts/hooks/pre-push` was ported from career-manager while GitHub Actions
minutes were exhausted and CI jobs died before running a step. It did two
things:

- a branch guard that let only `main` through and **refused every
  feature-branch push** unless `ALLOW_BRANCH_PUSH=1` was set;
- `pnpm verify` (Biome, tsc, Vitest, build, lockfile integrity, Semgrep) on
  every push, unless `SKIP_VERIFY=1` was set.

Both are now wrong for how this repo works:

- Changes reach `main` through pull requests. Ruleset 18642487 requires one,
  forbids deleting `main`, and has an empty bypass list. Refusing feature-branch
  pushes made the normal case need an override, and it also refused
  feature-branch **deletes**, so branch cleanup failed.
- CI runs again. This repo is public, so its jobs run on GitHub-hosted runners
  at no cost. Every `pnpm verify` check runs on each PR. All but Semgrep are
  required status checks on `main`'s branch protection. Running verify on
  every push duplicated that work, including on delete-only pushes that carry
  no code.
- The hook scanned nothing for secrets before a push. On a public repo, a
  pushed secret is exposed right away.

## Decision

The pre-push hook keeps only what has to happen before a push:

1. **Main guard.** Refuse any push to, or delete of, `refs/heads/main` unless
   `ALLOW_MAIN_PUSH=1`. Feature branches, their deletes, and tags pass.
   `ALLOW_BRANCH_PUSH` is removed.
2. **gitleaks over the pushed commit range**, skipping deletes. A missing
   `gitleaks` binary warns and continues. GitHub secret scanning with push
   protection is the server-side half.

`pnpm verify` and `SKIP_VERIFY` leave the hook. `scripts/verify.sh` stays as a
by-hand command. There is still no E2E stage (ADR-0008).

## Consequences

- A delete-only push runs nothing and exits 0.
- Feature-branch pushes need no override.
- Lint, type, test, build, lockfile, and Semgrep failures now surface on the
  PR, not before the push. Run `pnpm verify` by hand to catch them earlier.
- `ALLOW_MAIN_PUSH=1` only gets the push as far as GitHub. The ruleset still
  rejects a direct push to, or delete of, `main`.
- `git push --no-verify` skips the hook, as it always could. The hook is a fast
  local check, not the enforcement boundary.
