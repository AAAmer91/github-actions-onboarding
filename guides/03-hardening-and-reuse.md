# 03 — Hardening and reuse

## Scenario

The pipeline works, but shared automation needs predictable permissions, bounded execution, and abstractions that solve actual duplication. Harden the workflow first, then extract only what has a second consumer.

## 1. Make permissions explicit

Keep the default CI workflow read-only:

```yaml
permissions:
  contents: read
```

Add write permissions only to the job that performs a justified write. Do not grant repository-wide write access simply because a future step might need it.

For pull requests from forks, remember that secrets and write-capable tokens have additional restrictions. Never change to a more privileged event merely to make an untrusted workflow convenient.

## 2. Cancel obsolete branch runs

Add workflow-level concurrency:

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Push two small commits quickly to the same training branch and observe the older run. A branch-scoped group saves runner time while keeping unrelated branches independent.

## 3. Bound job execution

Add a sensible `timeout-minutes` value to each job. A timeout is operational protection against a hung tool, unavailable service, or waiting process.

Use `continue-on-error` only for a genuinely advisory check. Give that check a name that makes its non-blocking status obvious; do not hide a required quality gate behind it.

## 4. Create a reusable test workflow

Create `.github/workflows/reusable-tests.yml` with `workflow_call`. Define a typed string input named `node-version` and a string output named `tested-version`.

The reusable workflow should:

1. use `contents: read`;
2. run one job on `ubuntu-latest` with a timeout;
3. check out the caller's repository;
4. set up the requested Node.js version;
5. run `npm ci` and `npm test`;
6. expose the tested version through a step output and then a workflow output.

Call it from the main CI workflow at the job level:

```yaml
jobs:
  tests-node-24:
    uses: ./.github/workflows/reusable-tests.yml
    with:
      node-version: "24"
```

A reusable workflow is called as a job, not as a step.

## 5. Give reuse a real second caller

Create `.github/workflows/compatibility.yml` as a manually triggered workflow. Have it call the same reusable test workflow with Node.js 22.

The two callers now justify the abstraction:

- normal CI verifies the primary runtime;
- a manual compatibility run checks another supported runtime.

If there were only one caller and no standardization requirement, keeping the steps inline would probably be easier to understand.

## 6. Compare the reuse mechanisms

Create `.github/actions/setup-project/action.yml` as a small composite action that sets up Node.js and runs `npm ci`. The caller must check out the repository before invoking this local action, because the local action itself is stored in the checkout.

Use the comparison to decide where logic belongs:

| Mechanism | Called as | Best fit |
| --- | --- | --- |
| Reusable workflow | A job | Complete job policy, runner selection, permissions, and multiple steps |
| Composite action | A step | Repeated step sequence inside an existing job |
| JavaScript action | A step | Testable logic with inputs, outputs, APIs, and packaged dependencies |
| Package script | A shell command | Repository-local build, test, lint, or utility behavior |

## 7. Keep configuration types distinct

Use these channels intentionally:

- workflow inputs for caller-selected, non-secret behavior;
- environment variables for process configuration;
- secrets for sensitive values supplied at runtime;
- outputs for calculated data passed to later steps, jobs, or callers.

Do not put a real credential in this training repository. Secret masking reduces accidental display; it does not make arbitrary log handling safe.

## 8. Apply enterprise judgment

The examples stay deliberately generic and public-safe. When transferring these patterns to an enterprise environment, review:

- runner operating system, architecture, installed runner version, and network access;
- GitHub Enterprise Server compatibility, when applicable;
- action allowlists, mirrors, and approved version-pinning conventions;
- the narrowest token model: prefer `GITHUB_TOKEN` for current-repository work and use an approved GitHub App for scoped cross-repository automation;
- dry-run, idempotency, pagination, bounded retries, failure isolation, and verification before adding bulk writes;
- an internal test repository before any privileged rollout.

Do not copy internal runner labels, repository names, credentials, installation details, or production conventions into a public example. Learn those environment-specific details through authorized internal pairing.

## PR discussion prompts

- Why is a reusable workflow a job while a composite action is a step?
- What actual second consumer justifies the extracted test workflow?
- When should an advisory check use `continue-on-error`, and how should reviewers recognize it?
- Which permissions belong at workflow scope and which might be narrower at job scope?
- What evidence should a dry run show before a reviewer approves a write operation?

## Key takeaways

- Least privilege, concurrency, and timeouts are normal workflow design inputs.
- Reuse should remove real duplication or enforce a useful contract.
- Inputs, environment variables, secrets, and outputs solve different data-flow problems.
- Privileged workflows require a stronger trust-boundary review than ordinary CI.
- Public training should teach transferable patterns while keeping internal infrastructure details private.

The core onboarding path is complete. Use the [troubleshooting reference](../references/troubleshooting.md) when a workflow behaves unexpectedly.
