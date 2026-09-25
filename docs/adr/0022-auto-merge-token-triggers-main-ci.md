# ADR-0022: Auto-merge with a token whose pushes trigger CI

- Status: Proposed
- Date: 2026-09-25
- Amends: [ADR-0021](./0021-auto-merge-pull-requests.md) (the token only; the
  rest of that decision stands)

## Context

`cloudflare-deploy.yml` deploys on `workflow_run` of `CI` completing on `main`.
No deploy has run since 2026-09-13. CI's run history shows why:

- The last CI run with `event: push` on `main` is 34761101585, for 93a5669
  (#58), which Andrew merged by hand on 2026-09-13.
- Every PR merged since then (#59 to #65 and #72) shows
  `mergedBy: app/github-actions`, and none of them has a CI `push` run.
- The same is true of the Dependabot merges before #59 (#56 and #57 on
  2026-09-07). They have no CI `push` run either.
- The "Push on main" runs after 2026-09-13 are CodeQL default setup, a
  `dynamic` workflow. They are not CI, and bumping the gh-automation `ci.yml`
  in #65 changed nothing here.

ADR-0021's `auto-merge.yml` enables auto-merge with `github.token`. GitHub
performs an auto-merge as whoever enabled it, and a push made with
`GITHUB_TOKEN` does not start workflows (except `workflow_dispatch` and
`repository_dispatch`). So after #59 no merge started CI on `main`. CI never
completed there, and the deploy trigger never fired. Nothing looked broken:
PR checks stayed green, and main never showed a red CI because CI never ran.

Pointing `workflow_run` at another workflow would not help. There is nothing
that runs on those pushes except CodeQL, and gating a deploy on a security scan
instead of the test suite is the wrong gate.

## Decision

- `auto-merge.yml` enables auto-merge with a `AUTO_MERGE_TOKEN` repository
  secret instead of `github.token`. It is a fine-grained personal access token
  scoped to `kornsour/portfolio-site` only, with **Contents: Read and write**
  and **Pull requests: Read and write**. Merges made with it are ordinary
  pushes that start `CI` on `main`, and `cloudflare-deploy.yml` follows.
- The job **fails if the secret is missing**. It never falls back to
  `github.token`, because that fallback is exactly the silent no-deploy this
  ADR fixes. A failed auto-merge only leaves the PR open. A hand merge starts
  CI, so the site still deploys.
- `cloudflare-deploy.yml`'s trigger is unchanged. `workflow_run` on `CI` was
  correct all along.

## Consequences

- CI runs on `main` again, and a green `main` deploys again.
- The secret is only available to same-repository PRs, which are the only ones
  the job acts on. Fork and Dependabot runs never receive it.
- The token expires. When it does, auto-merge fails loudly on the next PR until
  it is rotated.
- **Dependabot merges still do not deploy.** `dependabot-auto-merge.yml` calls
  `kornsour/gh-automation`'s reusable workflow, which merges with
  `GITHUB_TOKEN`. Their changes go live with the next human-authored merge,
  because the deploy builds the head of `main`. Fixing that needs the reusable
  workflow to accept a token, which is a `gh-automation` change.
