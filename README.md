# GitHub Actions Onboarding Exercise

**TypeScript + Git + VS Code CI Learning Lab**

> Approach: Build the workflow incrementally. Do not copy a finished pipeline. The objective is to understand why each GitHub Actions concept exists and how the pieces fit together.

# Goal

Create a small TypeScript application and build its CI pipeline from scratch. The application stays intentionally simple so the focus remains on GitHub Actions rather than application complexity.

By the end of the exercise, you should understand:

- workflow files, events, and triggers
- runners, jobs, steps, actions, and shell commands
- contexts and environment variables
- job dependencies and data flow
- step and job outputs
- conditions and matrices
- artifacts and caching
- reusable workflows
- workflow permissions
- debugging failed and skipped workflows
- using Git for branches, commits, pushes, pulls, and pull requests
- using VS Code as the local development and troubleshooting environment

# Project

Create a repository named:

```
github-actions-onboarding
```

The application will be a very small TypeScript CLI.

Development will be done in VS Code and every exercise change should flow through Git: edit -> inspect -> commit -> push -> pull request -> GitHub Actions.

```
$ npm run start -- Developer
Hello, Developer!
```

The repository should eventually look approximately like this:

```
github-actions-onboarding/
|
+-- .github/
|   +-- workflows/
|       +-- ci.yml
|       +-- reusable-tests.yml
|
+-- src/
|   +-- hello.ts
|
+-- tests/
|   +-- hello.test.ts
|
+-- dist/
|
+-- package.json
+-- package-lock.json
+-- tsconfig.json
+-- README.md
```

# Local Development Foundation - Git and VS Code

Before creating the first workflow, set up the same local development loop that will be used throughout the exercise.

## VS Code setup

Open the repository in VS Code and become comfortable with the four areas used throughout this exercise:

- Explorer - browse source files, tests, package files, and .github/workflows.
- Integrated Terminal - run Git, npm, Node.js, and local validation commands without leaving the editor.
- Source Control - inspect changed files, diffs, staged changes, commits, and the current branch.
- Problems and terminal output - use them to diagnose TypeScript, lint, test, and workflow-related issues.

Verify the local tools from the VS Code terminal:

```
git --version
node --version
npm --version
code --version
```

## Git foundation

Clone the repository, open it in VS Code, and inspect the initial state:

```
git clone <repository-url>
cd github-actions-onboarding
code .
git status
git branch --show-current
git log --oneline --decorate -5
```

Before making changes, verify that Git has the correct author identity configured for this repository or machine:

```
git config user.name
git config user.email
```

Do not change global Git identity settings unless they are actually incorrect.

## Working loop used throughout the exercise

For each meaningful task, use a small branch and commit cycle instead of making all changes directly on main.

```
main
  |
  +-- create branch
       |
       +-- edit in VS Code
       |
       +-- run locally
       |
       +-- inspect diff
       |
       +-- stage and commit
       |
       +-- push
       |
       +-- open/update PR
       |
       +-- inspect GitHub Actions
```

Example for the first workflow:

```
git switch -c feature/first-workflow

# Make the change in VS Code, then inspect it
git status
git diff

# Stage and commit the finished change
git add .github/workflows/hello.yml
git diff --staged
git commit -m "Add first GitHub Actions workflow"

# Publish the branch
git push -u origin feature/first-workflow
```

The same operations may be performed through VS Code Source Control, but the Git commands should also be understood. The GUI should make Git easier to use, not hide the underlying model.

## Git concepts to understand before continuing

- working tree - files currently being edited locally
- staging area - the exact changes selected for the next commit
- commit - a recorded repository state with history and metadata
- branch - a movable line of development
- remote - another copy of the repository, such as origin
- push - send local commits to a remote branch
- fetch - retrieve remote history without integrating it
- pull - retrieve and integrate remote changes according to the configured strategy
- pull request - review and integration proposal between branches; it is not itself a Git commit

## Expected learning

- Use VS Code as the normal local workspace without depending entirely on its GUI.
- Understand the path from a local edit to a remote branch and pull request.
- Read git status and git diff before committing.
- Keep commits small enough that their purpose is clear.
- Understand that GitHub Actions reacts to repository events produced by this Git workflow.

> Important: Do not create the final workflow immediately. Build it incrementally through the tasks below.

# Step 1 - First workflow

*Learn the basic Workflow -> Job -> Step hierarchy.*

Create:

```
.github/workflows/hello.yml
```

The workflow should:

1.   Run manually using workflow_dispatch.

2.   Contain one job.

3.   Run on Linux.

4.   Print: Hello from GitHub Actions!

5.   Print useful GitHub context information: repository, branch/ref, commit SHA, and actor.

```
Workflow
  -> Job
      -> Step
```

## Expected learning

- Understand the relationship between on:, jobs:, runs-on:, steps:, and run:.

# Step 2 - Run on repository events

*Make the workflow event-driven.*

Modify the workflow so it runs automatically for pushes to main, pull requests targeting main, and manual execution.

Create a feature branch, make the change in VS Code, inspect the diff, commit it, push the branch, and open a pull request. Observe which event triggered the workflow and inspect values such as:

```
git switch -c feature/event-triggers
git status
git diff
git add .
git diff --staged
git commit -m "Run workflow on repository events"
git push -u origin feature/event-triggers
```

After the pull request is open, push one additional commit to the same branch and observe that the pull request workflow runs again.

```
github.event_name
github.ref
github.sha
github.actor
```

## Expected learning

- GitHub Actions workflows are event-driven.
- The same workflow can behave differently depending on what caused it to run.

# Step 3 - Checkout the repository

*Understand when repository source files become available on the runner.*

Add repository checkout. After checkout:

1.   List the repository files.

2.   Print the current commit.

3.   Inspect package.json.

Compare:

```
run:   # execute a shell command
uses:  # invoke an action or reusable workflow
```

## Expected learning

- Starting a runner does not automatically mean the repository source code has been checked out.
- Distinguish the local clone created with git clone from actions/checkout, which places repository content onto the temporary CI runner.
- Understand the difference between run and uses.

# Step 4 - Set up Node.js

*Configure the runtime used by the project.*

Configure Node.js in the workflow, then print:

```
node --version
npm --version
```

```
Runner
  |
  +-- Checkout repository
  |
  +-- Setup Node.js
  |
  +-- Execute commands
```

## Expected learning

- The runner is the machine executing the job.
- Actions can configure tools and environments on that runner.

# Step 5 - Install dependencies

*Introduce deterministic dependency installation.*

Install project dependencies. Prefer:

```
npm ci
```

rather than:

```
npm install
```

for CI when a lock file exists. Investigate why npm ci is normally preferred in automated builds.

## Expected learning

- Understand the relationship between package.json, package-lock.json, and node_modules.
- Understand why deterministic dependency installation matters in CI.

# Step 6 - Run the TypeScript application

*Execute the same project commands locally and in CI.*

Create a small function such as:

```
export function hello(name?: string): string {
  return `Hello, ${name || "World"}!`;
}
```

The CLI should support:

```
npm run start -- Developer

# Expected output
Hello, Developer!
```

## Expected learning

- A workflow can execute the same project commands a developer executes locally.
- CI YAML should orchestrate project commands rather than reimplement project behavior.

# Step 7 - Add automated tests

*Make CI detect incorrect behavior.*

Add a small test suite, for example:

```
hello("Developer") -> "Hello, Developer!"
hello()         -> "Hello, World!"
```

Expose the tests through npm test. Update the workflow so it checks out the repository, sets up Node.js, installs dependencies, and runs the tests.

Then intentionally break one test or the implementation, observe the failed workflow, and fix it.

```
Change
   |
   v
Tests
   |
   +---- failure -> stop
   |
   +---- success -> continue
```

## Expected learning

- A CI workflow acts as a quality gate, not just automation.
- Become comfortable reading the failed step logs.

# Step 8 - Add linting

*Introduce a second form of source validation.*

Add a simple linting setup and expose it through:

```
npm run lint
```

```
Source Code
    |
    +-- Lint
    |
    +-- Test
    |
    +-- Build
```

## Expected learning

- Different types of validation can be represented as separate CI checks.

# Step 9 - Compile TypeScript

*Create a genuine build stage and generated output.*

Add:

```
npm run build
```

The TypeScript compiler should generate JavaScript into dist/.

```
src/hello.ts
      |
      | tsc
      v
dist/hello.js
```

## Expected learning

- Understand the distinction between source code, validation, compilation, and generated build output.

# Step 10 - Split the workflow into jobs

*Model the workflow as an explicit dependency graph.*

```
validate
   |
   v
test
   |
   v
build
```

The test job must depend on validate. The build job must depend on test. Use explicit job dependencies rather than relying on assumed execution order.

## Expected learning

- Understand needs:.
- A workflow is a dependency graph rather than simply a long shell script.

# Step 11 - Pass information between jobs

*Learn how jobs exchange calculated metadata.*

The first job should generate a value such as:

```
version=1.0.<run-number>
```

Expose it as a job output. A later job should consume it and print something similar to:

```
Building version 1.0.42
```

```
step output
     |
     v
job output
     |
     v
needs.<job>.outputs.<output>
```

## Expected learning

- Understand step outputs, job outputs, and needs.<job>.outputs.<output>.
- Recognize why this matters for versions, artifact names, release metadata, and other calculated values.

# Step 12 - Add conditions

*Separate workflow triggering from job-level execution decisions.*

Modify the pipeline so the build/package stage only happens for main or manual executions. Pull requests should still run validation and tests.

```
Pull Request
    |
    +-- Validate
    +-- Test
    +-- No package

main
    |
    +-- Validate
    +-- Test
    +-- Build
    +-- Package
```

## Expected learning

- Use expressions and if: conditions.
- Understand that workflow triggers and job conditions solve different problems.

# Step 13 - Add a Node.js matrix

*Run the same test definition against several runtime versions.*

Run the tests against multiple Node.js versions, for example:

```
Node.js 20
Node.js 22
Node.js 24
```

Do this with one job definition rather than copying the test job multiple times.

```
strategy:
  matrix:
```

```
                   Test
                    |
       +------------+------------+
       |            |            |
       v            v            v
    Node 20      Node 22      Node 24
```

## Expected learning

- Understand strategy.matrix.
- Understand why matrices are preferable to duplicated jobs.

# Step 14 - Produce an artifact

*Preserve the output created by the build.*

Package the compiled application. For example:

```
dist/
  hello.js

# Optional
hello-app.zip
```

Upload the generated package as a workflow artifact. Then download the artifact manually from the workflow run and inspect it.

```
TypeScript
    |
    v
Compilation
    |
    v
dist/
    |
    v
Artifact
```

## Expected learning

- Artifacts preserve files produced by a workflow for later inspection or consumption.

# Step 15 - Add dependency caching

*Distinguish reusable build acceleration from workflow output preservation.*

Configure npm dependency caching. Run the workflow multiple times and inspect the logs.

```
Cache      -> helps future runs avoid repeating expensive work
Artifact   -> preserves the output of a workflow
```

## Expected learning

- Understand the difference between a cache and an artifact.

# Step 16 - Create a reusable workflow

*Extract workflow-level logic where reuse is meaningful.*

Move the test logic into:

```
.github/workflows/reusable-tests.yml
```

The workflow should use:

```
on:
  workflow_call:
```

The main workflow should call it rather than duplicating test implementation. Pass the desired Node.js version as an input.

## Expected learning

- Understand the difference between a normal workflow, reusable workflow, composite action, JavaScript action, and shell script.
- Do not extract logic merely because it can be extracted. Reuse should solve real duplication or provide a useful abstraction.

# Step 17 - Understand permissions

*Apply least privilege to the workflow token.*

Inspect the default GITHUB_TOKEN. Explicitly define the minimum workflow permissions required.

```
permissions:
  contents: read
```

Do not grant write permissions just because they are available.

## Expected learning

- Workflow permissions should follow least privilege.

# Step 18 - Debugging exercise

*Practice diagnosing common failures instead of treating CI as a black box.*

## Problem 1 - Invalid command

Change npm test to a nonexistent npm command and find the useful error in the workflow logs.

## Problem 2 - Compilation failure

Introduce a TypeScript type error. Observe how the build fails and identify the exact job and step that detected the problem.

## Problem 3 - Failed dependency

Make test depend on a failing validate job and observe what happens to the dependent job.

## Problem 4 - Broken output

Reference a job output incorrectly and diagnose why the value is missing.

## Problem 5 - Incorrect condition

Add an incorrect if: expression that unexpectedly skips the build job. Use workflow context and logs to determine why it was skipped.

## Problem 6 - Local change not present in CI

Edit a workflow or source file locally but intentionally do not commit or push it. Compare VS Code Source Control, git status, the remote branch, and the GitHub Actions run to explain why CI cannot see the local change.

```
Workflow
   |
   +-- Job
        |
        +-- Step
             |
             +-- Logs
```

## Expected learning

- Become comfortable debugging from workflow -> job -> step -> logs.

# Step 19 - Final pipeline

*Refactor the accumulated work into one clean, understandable architecture.*

```
                     +----------------+
                     |    Trigger     |
                     +-------+--------+
                             |
                             v
                     +----------------+
                     |    Validate    |
                     |   Lint/Check   |
                     +-------+--------+
                             |
                             v
                  +----------------------+
                  |     Test Matrix      |
                  |                      |
                  | Node.js 20           |
                  | Node.js 22           |
                  | Node.js 24           |
                  +----------+-----------+
                             |
                             v
                     +----------------+
                     |     Build      |
                     |      tsc       |
                     +-------+--------+
                             |
                             v
                     +----------------+
                     |    Package     |
                     +-------+--------+
                             |
                             v
                     +----------------+
                     |    Artifact    |
                     +----------------+
```

The implementation should favor:

- simple jobs
- meaningful names
- minimal permissions
- no unnecessary duplication
- reusable logic only where reuse provides value
- explicit dependencies
- understandable conditions
- deterministic dependency installation
- easy-to-read logs

# Step 20 - Explain your implementation

*Prove understanding by explaining the design without simply reading the YAML.*

Once finished, answer these questions:

1.   What starts the workflow?

2.   What is a runner?

3.   What is the difference between a job and a step?

4.   What is the difference between run and uses?

5.   Why is repository checkout required?

6.   Why is Node.js setup required?

7.   Why use npm ci in CI?

8.   What happens if validate fails?

9.   What does needs do?

10.   How is information transferred between jobs?

11.   What is a matrix?

12.   What is an artifact?

13.   What is a cache?

14.   What is the difference between a cache and an artifact?

15.   Why use a reusable workflow?

16.   What is GITHUB_TOKEN?

17.   Why should permissions be minimized?

18.   What is the difference between a workflow input, environment variable, secret, and output?

19.   What is the difference between a workflow trigger and an if: condition?

20.   How would you investigate a job that was unexpectedly skipped?

21.   What is the difference between the working tree, staging area, and a commit?

22.   What is the difference between fetch, pull, and push?

23.   Why work on a feature branch instead of committing directly to main?

24.   What causes a pull request workflow to run again after the pull request is already open?

25.   What is the difference between cloning the repository locally and using actions/checkout inside a workflow?

26.   How can VS Code Source Control help inspect the same Git state shown by git status and git diff?

> Checkpoint: If these questions can be answered comfortably, the important GitHub Actions fundamentals have been understood.

# Optional Advanced Tasks

*Continue only after the main exercise is understood.*

## A. Concurrency

Prevent obsolete workflow runs from continuing when newer commits are pushed to the same pull request. Understand how this saves runner time and avoids obsolete results completing after newer runs.

## B. Timeout

Configure a sensible job timeout and understand why workflows should not run forever because of a hung process.

## C. Continue-on-error

Add an experimental check that may fail without failing the whole workflow. Explain why this should be used carefully.

## D. Composite Action

Extract several related steps into a local composite action. Compare it with the reusable workflow and determine which abstraction is more appropriate for each use case.

## E. Tag workflow

Create a separate workflow triggered when a tag matching v* is pushed, for example v1.0.0. It should install, test, build, and package. Do not introduce publishing or deployment credentials.

```
Tag
 |
 v
Install
 |
 v
Test
 |
 v
Build
 |
 v
Package
```

## F. Environment variables and secrets

Add a harmless environment variable such as APP_ENV=ci, then compare normal variables with secrets. Do not use real credentials for the exercise.

## G. Git history and conflict resolution

Create two branches that modify the same small section of a file, then merge or rebase in a disposable training branch and resolve the conflict in VS Code. Inspect the final diff before committing the resolution.

The goal is to recognize a conflict, understand why Git cannot choose automatically, and verify the resolved content before completing the operation.

# Final Challenge

*Recreate the architecture from understanding rather than copying.*

Create another small repository without copying the existing workflow. The application can be TypeScript again or use another language.

Reproduce the same basic CI architecture from memory:

```
Trigger
   |
   v
Validation
   |
   v
Tests
   |
   v
Build
   |
   v
Package
```

The important requirement is that the workflow is recreated from understanding rather than copied line-by-line.

# Success Criteria

The exercise is complete when you can:

- create a workflow without copying an existing one
- understand why each job exists
- understand why each dependency exists
- distinguish run from uses
- diagnose failed and skipped jobs
- use contexts and expressions
- pass data between jobs
- build a matrix
- create and consume artifacts
- understand caching
- create and call a reusable workflow
- configure appropriate permissions
- explain the complete development loop to another engineer: VS Code edit -> Git branch/commit/push -> pull request -> GitHub Actions