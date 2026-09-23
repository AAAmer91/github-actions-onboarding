# GitHub Actions troubleshooting reference

Start with the smallest failing boundary: workflow, job, step, then log line. Confirm the exact commit and event before changing YAML.

| Symptom | Likely cause | First checks |
| --- | --- | --- |
| Workflow did not start | Trigger, branch, or path filter does not match the event | Open the workflow file at the pushed commit; compare `on` with the actual event and target branch |
| CI cannot see a local edit | The change was not committed and pushed to the run's ref | Check `git status`, `git log -1`, the remote branch, and the run SHA |
| Repository files are missing | Checkout has not run in this job | Confirm `actions/checkout` appears before file access; remember every job has a new runner |
| Command exists locally but not in CI | Tool/runtime was not installed or versions differ | Print versions, inspect setup steps, and compare with `.node-version` and `package.json` |
| Dependent job is skipped | A required job failed, was skipped, or its condition evaluated false | Inspect every job in `needs` and evaluate the dependent job's `if` expression with the event context |
| Job output is empty | Step lacks an `id`, output was not written to `$GITHUB_OUTPUT`, or promotion path is wrong | Trace step output → job output → `needs.<job>.outputs.<name>` |
| Condition behaves differently on a PR | Push and pull-request refs and payloads differ | Print selected context values; distinguish workflow triggering from job-level `if` |
| Cache never hits | Key, dependency path, OS, version, or ref scope changes each run | Inspect setup/cache logs and key inputs; verify the lock file is checked out before hashing |
| Cache hits but install still runs | Expected behavior | Package-manager caching accelerates downloads; it does not replace deterministic installation |
| Artifact is empty or missing | Upload path is wrong, build did not create it, or the producer was skipped | List files immediately before upload and check the producer job's condition |
| Local action cannot be found | Repository was not checked out before `uses: ./` | Move checkout before the local-action step |
| Permission denied | `GITHUB_TOKEN` lacks the required explicit permission or the event is untrusted | Inspect workflow/job `permissions`, event type, fork status, and the exact API operation |
| Secret is empty in a pull request | Secrets are restricted for the event or fork | Do not weaken the trust boundary; redesign the workflow or use an approved trusted process |
| Action fails only on a self-hosted runner | Runner, OS, shell, network, or action runtime is incompatible | Check runner version, platform documentation, proxy/network access, and action release requirements |
| Reusable workflow input is missing | Input was not declared under `workflow_call` or not passed by the caller | Compare the reusable contract with the caller's `with` block and input type |
| Old run completes after a newer commit | No branch-scoped concurrency cancellation | Add a stable concurrency group and decide whether `cancel-in-progress` matches the workflow's purpose |

## A compact investigation loop

1. Identify the run event, ref, and SHA.
2. Open the first failed or unexpectedly skipped job.
3. Find the first step whose actual result differs from the expected result.
4. Read the complete step log before editing.
5. Reproduce the project command locally when possible.
6. Make one focused change and rerun through a new commit or manual dispatch.

Avoid changing permissions, event types, and conditions simultaneously. Multiple speculative changes make it difficult to learn which assumption was wrong.

Return to the [learning path](../README.md#learning-path).
