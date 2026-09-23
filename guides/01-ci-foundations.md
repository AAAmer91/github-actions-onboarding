# 01 — CI foundations

## Scenario

The repository already contains a working TypeScript CLI, tests, lint rules, a compiler configuration, and a compiler configuration. Your first task is to make GitHub run the same quality commands that already work locally.

This guide deliberately starts with one job. A single job makes the runner lifecycle visible before orchestration adds more moving parts.

> **Version note:** The action majors in this public lab target current GitHub.com. On GitHub Enterprise Server or self-hosted runners, use only the approved or mirrored versions compatible with the platform and runner release. Guide 03 discusses enterprise considerations.

## Before editing YAML

Run the project locally:

```bash
npm ci
npm run check
npm run start -- Developer
```

`npm ci` installs exactly what the committed lock file describes. `npm run check` runs linting, tests, and compilation.

## 1. Create the workflow

Create `.github/workflows/ci.yml` and give it a clear name. Configure these events:

- manual runs with `workflow_dispatch`;
- pushes to `main`;
- pull requests targeting `main`.

Start with read-only repository access:

```yaml
permissions:
  contents: read
```

The workflow should have one job named `quality` running on `ubuntu-latest`.

## 2. Inspect selected context values

Add an early step that prints only the values useful for understanding the current run:

```yaml
- name: Show run context
  run: |
    echo "event=${{ github.event_name }}"
    echo "repository=${{ github.repository }}"
    echo "ref=${{ github.ref }}"
    echo "sha=${{ github.sha }}"
    echo "actor=${{ github.actor }}"
```

Avoid dumping an entire context or event payload into logs. Real events can contain more data than a troubleshooting session needs.

## 3. Prepare the runner

A fresh hosted runner does not contain this repository automatically. Add steps that:

1. check out the repository with `actions/checkout@v7`;
2. install Node.js 24 with `actions/setup-node@v7`;
3. print `node --version` and `npm --version`;
4. install dependencies with `npm ci`.

Keep checkout before any step that reads repository files 

## 4. Run the quality commands

Add separate named steps for:

```text
npm run lint
npm test
npm run build
```

Separate steps make failures easier to locate. The workflow should orchestrate the package scripts rather than reproduce their implementation in YAML.

## 5. Observe real events

Create a small branch, commit the workflow, push it, and open a pull request. Compare the context values from the pull-request run with a manual run.

Push a second commit to the same branch and notice that the pull-request workflow runs again. GitHub Actions reacts to repository events; opening a pull request is not the only event associated with that pull request.

## Try one failure safely

On the training branch, temporarily change one workflow command to a nonexistent npm script. Inspect the run from workflow to job to step to log, then restore the valid command in the next commit.

## PR discussion prompts

- Which files exist on the runner before and after checkout?
- What differs between `github.ref` on a push and on a pull request?
- Why are project commands kept in `package.json` instead of embedded in workflow YAML?
- Which permission would this read-only CI job need if it later attempted to create a release?

## Key takeaways

- A workflow is event-driven and contains jobs made of ordered steps.
- A runner is an execution environment, not a permanent development machine.
- `uses` invokes an action; `run` executes a shell command.
- Checkout, runtime setup, deterministic installation, and project commands form the basic Node.js CI loop.

Continue with [02 — Pipeline orchestration](02-pipeline-orchestration.md).

