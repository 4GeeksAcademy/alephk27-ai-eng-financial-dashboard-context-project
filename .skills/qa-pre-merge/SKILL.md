---
name: qa-pre-merge
description: "Run a focused, evidence-based pre-merge QA review for this financial dashboard. Use when preparing changes for review or merge, checking what tests/build/lint to run, or reporting verification results."
---

# QA pre-merge — Financial Metrics Dashboard

## Objective

Produce a minimal, reproducible verification plan for the changed files in this repository, run the relevant checks when possible, and report only what their output proves. This skill guides QA; it does not approve a merge or replace code review.

## Inputs

- The change under review: branch diff, PR diff, or an explicitly named set of files.
- The intended behavior and affected surface (frontend, backend, API contract, or local infrastructure), if known.
- Available execution environment (host or existing Docker Compose services) and any user-specified constraints.

If the diff or intended behavior cannot be identified, ask for clarification rather than guessing. Preserve unrelated working-tree changes; do not stage, commit, or rewrite files during QA.

## Workflow

1. **Bound the review.** Inspect `git status` and the targeted diff. Separate pre-existing/unrelated changes from the change being checked. Map changed files to frontend, backend, contracts, or infrastructure.
2. **Select focused checks from existing project commands.** Do not install dependencies or add scripts as part of QA.
   - Frontend behavior/tests: from `frontend/`, run `npm run test -- <relevant-test-file>` (the script invokes `vitest run`). For frontend source or config changes, run `npm run build`; run `npm run lint` for changed TypeScript/TSX or lint/config-sensitive files.
   - Backend behavior: run the relevant test selection under `backend/tests/` (for example, `pytest -q backend/tests/test_routes.py -k '<case>'`) in the configured Python environment or existing backend container.
   - API contract changes: include focused route/model tests and verify the frontend consumer/types when affected.
   - Compose, Docker, ports, or proxy changes: run `docker compose config --quiet`; if runtime connectivity is part of the change, separately verify the documented endpoint without treating HTTP 200 as proof of visual correctness.
   - Documentation/agent-skill-only changes: verify links, command names, paths, and consistency with repository files; do not run unrelated application tests.
3. **Run only relevant checks.** Prefer one focused test target. Add build/lint/config checks only when relevant to the changed surface. Do not run the full suite by default. If a required tool/dependency is unavailable or a command fails, report the exact blocker; do not silently substitute an unverified result.
4. **Compare warnings honestly.** Record warnings and compare them with known baseline notes in `verification.md` when relevant. A historical warning (including Vite's >500 kB chunk notice) is not automatically a new regression; distinguish unchanged, new, and unverified warnings.
5. **Report evidence and limits.** Do not claim that tests, builds, browser rendering, accessibility, or production behavior passed unless that specific check ran and passed. Do not make code changes as part of the QA review unless explicitly requested.

## Expected output

Return a concise pre-merge report with:

- Scope checked (files/behavior) and any unrelated changes excluded.
- A table or bullet list of exact commands and outcomes (`passed`, `failed`, `blocked`, or `not run`).
- Relevant warnings, known-baseline comparison, and remaining risks/coverage gaps.
- A clear verification status; never label the change "merge-ready" solely because one check passed.

## Acceptance criteria

- Every check is traceable to an affected file or behavior and uses a command declared by this repo or a standard focused test invocation.
- Test/build/lint/config outcomes are reported separately and accurately; unavailable checks are marked blocked or not run.
- No unrelated files are modified, staged, or committed during QA.
- The report distinguishes source inspection from executed evidence and explicitly notes meaningful unverified behavior.
- The check set is focused; full-suite execution is reserved for a broad change or an explicit request.
