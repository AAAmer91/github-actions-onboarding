# 02 — Pipeline orchestration

## Scenario

The first workflow proves that the project can pass CI. Now reshape it so independent checks can run concurrently, compatibility is visible, and build output can move between isolated jobs.

## 1. Refactor the job graph

Replace the single `quality` job with these responsibilities:

```text
lint ───────────────┐
                   │
test (Node 22, 24) ├──> package
                   │
build ─────────────┘
```

`lint`, `test`, and `build` should be independent. `package` should declare:

```yaml
needs: [lint, test, build]
```

This makes the quality gates explicit without serializing work that can run in parallel.

## 2. Account for job isolation

Each job receives a separate runner. A checkout, Node installation, or `npm ci` performed in `lint` does not prepare the runner used by `test` or `build`.

Give every job the setup it needs. Do not pass `node_modules` between jobs as an artifact. Later, caching can accelerate installation without pretending that jobs share a filesystem.

## 3. Add a compatibility matrix

Turn `test` into one job definition that runs on maintained Node.js lines:

```yaml
strategy:
  fail-fast: false
  matrix:
    node-version: [22, 24]
```

Use `${{ matrix.node-version }}` as the `node-version` input to `actions/setup-node@v7`. Include the version in the job name so the Actions UI is easy to scan.

`fail-fast: false` lets both compatibility results finish. That is useful in a learning lab because one failure does not hide the other result; production policy may choose differently.

## 4. Produce a job output

Have the `build` job calculate harmless build metadata in a step with an `id`:

```yaml
- name: Calculate version
  id: version
  shell: bash
  run: echo "value=1.0.${{ github.run_number }}" >> "$GITHUB_OUTPUT"
```

Promote the step output to a job output:

```yaml
outputs:
  version: ${{ steps.version.outputs.value }}
```

The package job can then read `${{ needs.build.outputs.version }}`. Small strings belong in outputs; files belong in artifacts.

## 5. Move build files with an artifact

The `build` job should run `npm run build` and upload the generated `build/` directory with `actions/upload-artifact@v7`.

The `package` job should:

1. wait for all three quality jobs;
2. download the build artifact with `actions/download-artifact@v8`;
3. list the downloaded files;
4. print the calculated version;
5. upload the packaged result with a meaningful name containing the version.

Download the artifact from the completed workflow run and inspect it. The artifact should contain generated JavaScript, not `node_modules` or the whole repository.

## 6. Add npm caching

Configure `actions/setup-node@v7` with:

```yaml
with:
  node-version: 24
  cache: npm
  cache-dependency-path: package-lock.json
```

Run the workflow twice and compare the setup logs. The npm cache can accelerate downloads, but `npm ci` still installs dependencies into the current job's workspace. The setup action does not cache `node_modules`.

## Cache and artifact mental model

| Concern | Cache | Artifact |
| --- | --- | --- |
| Primary purpose | Speed up later work | Preserve or transfer run output |
| Lookup | Key/version and ref access rules | Named artifact associated with a run |
| Expected contents | Reusable dependency data | Build, test, report, or package output |
| Correctness | Workflow must survive a miss | Consumer expects an uploaded file |
| Mutability | Existing entries are not edited in place | New uploads create run artifacts |

A cache is not scoped to a commit unless its key includes commit-specific data. Depending on the event and ref, runs may restore caches from the current, base, or default branch.

## Optional condition

Keep linting, tests, and build verification on pull requests, but run the final package job only for `main` pushes or manual runs. Express that rule on the package job with `if`, separate from workflow triggering.

## PR discussion prompts

- Which jobs can start together, and which edge makes `package` wait?
- Why does every isolated job repeat checkout, setup, and installation?
- What should move through an output, and what should move through an artifact?
- What evidence in the logs shows a cache hit without proving that `npm ci` can be removed?

## Key takeaways

- A workflow is a dependency graph, not merely a long shell script.
- Jobs are isolated; `needs` controls order and exposes upstream outputs.
- Matrices express compatibility without duplicating job definitions.
- Artifacts preserve files; caches are optional acceleration and must not be required for correctness.

Continue with [03 — Hardening and reuse](03-hardening-and-reuse.md).
