# GitHub Actions Onboarding Lab

A hands-on, peer-friendly lab for TypeScript engineers joining a GitHub and DevOps team. The sample application already works; the learner focuses on workflows, automation boundaries, and operational judgment.

## Project Structure & Target Architecture

The application code, tests, and build tooling are pre-configured. Your goal is to build the `.github/` workflow automation:

```text
github-actions-onboarding/
│
├── .github/
│   └── workflows/                 <-- 🎯 What you build across the guides
│       ├── ci.yml                 (Guides 01 & 02: quality gates, matrix, outputs, artifacts, cache)
│       ├── reusable-tests.yml     (Guide 03: reusable test workflow)
│       └── compatibility.yml      (Guide 03: second caller for reusable workflow)
│
├── guides/                        <-- 3 self-paced guides
│   ├── 01-ci-foundations.md       (Triggers, Node setup, Lint/Test/Build)
│   ├── 02-pipeline-orchestration.md (Job graphs, Matrix, Caches & Artifacts)
│   └── 03-hardening-and-reuse.md  (Permissions, Concurrency, Reusable Workflows)
│
├── references/
│   └── troubleshooting.md         (Symptom-to-cause diagnostic table)
│
├── src/                           <-- Pre-configured TypeScript CLI
│   ├── cli.ts
│   └── hello.ts
│
├── tests/                         <-- Pre-configured test suite
│   └── hello.test.ts
│
├── jest.config.mjs                (ESM Jest configuration)
├── package.json                   (Jest, ESLint, TypeScript)
├── tsconfig.json
└── README.md
```

## Start here

```bash
git clone https://github.com/AAAmer91/github-actions-onboarding.git
cd github-actions-onboarding
npm ci
npm run check
npm run start -- Developer
```

Expected CLI output: `Hello, Developer!`

## Learning path

| Guide | Focus |
| --- | --- |
| [01 — CI foundations](guides/01-ci-foundations.md) | Triggers, runners, contexts, checkout, and quality commands |
| [02 — Pipeline orchestration](guides/02-pipeline-orchestration.md) | Job graphs, outputs, matrices, artifacts, and caches |
| [03 — Hardening and reuse](guides/03-hardening-and-reuse.md) | Permissions, concurrency, reusable workflows, and composite actions |

## Existing commands

```bash
npm run lint
npm test
npm run build
npm run check
```

Use small branches and one or more pull requests. Review the YAML together and use the optional discussion prompts as conversation starters—not as an exam.

When a run behaves unexpectedly, use the [troubleshooting reference](references/troubleshooting.md).

