# ADR-0021: Auto-merge pull requests once required checks pass

- Status: Proposed
- Date: 2026-09-13

## Context

Every change reaches `main` through a pull request. Ruleset 18642487 blocks
direct pushes to and deletes of `main`. Classic branch protection requires five
status checks, in strict mode: `ci / Lint & format (Biome)`, `ci / Type check`,
`ci / Unit tests (Vitest)`, `ci / Build`, `lockfile / integrity`. Zero approving
reviews are required, and the same account writes and merges every PR.

So once CI is green, the merge click adds no review. It only adds a wait, and
work handed to agents sits open until someone checks. The Lurking-Walrus repos
fixed this on 2026-09-05: green CI is the merge gate. They call a shared
`auto-merge-reusable.yml` in `Lurking-Walrus/.github-private`.

This repo can't call it. The repo is public and owned by `kornsour`, and that
workflow is private in another owner's repository. `kornsour/gh-automation`
has only `dependabot-auto-merge.yml`, which auto-merges Dependabot patch and
minor bumps and leaves majors for manual review.

The repo already has `allow_auto_merge`, `allow_squash_merge`, and
`delete_branch_on_merge` turned on.

## Decision

- **Add `.github/workflows/auto-merge.yml`, inlined.** On `opened`, `reopened`,
  and `ready_for_review`, it runs `gh pr merge --auto --squash`. GitHub then
  merges the PR once branch protection is met. A red check does not merge.
- **Skip drafts.** The `ready_for_review` trigger picks them up later.
- **Never auto-merge a fork PR.** The job runs only when the head repository is
  this repository. On a public repo anyone can open a fork PR, so this is a
  security boundary.
- **Exclude Dependabot PRs** by author (`pull_request.user.login`), not by
  `github.actor`. This keeps `dependabot-auto-merge.yml` in charge of them, so
  major bumps still need a manual merge. Checking the actor would let a
  human-reopened Dependabot PR through.
- **Job-scoped permissions only:** `contents: write` and `pull-requests: write`,
  both required by the auto-merge mutation.
- **Canonical runner expression.** On this public repo it resolves to
  `ubuntu-latest`, so fork-triggered events never reach the self-hosted fleet.

## Consequences

- A green non-draft PR from this repository merges without anyone clicking
  merge, and its branch is deleted.
- To keep a PR open on purpose, mark it draft or turn off auto-merge on it.
- Dependabot majors still wait for a person.
- Semgrep is not a required check, so an ERROR-severity finding does not stop
  an auto-merge. To gate on it, add `ci / Security scan (Semgrep)` to the
  required checks.
- If `kornsour/gh-automation` gains a generic auto-merge workflow, replace this
  inline job with a call to it.
