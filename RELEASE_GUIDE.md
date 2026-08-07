# Release Guide

Releases are fully automated with [semantic-release](https://semantic-release.gitbook.io/).
You should never need to hand-edit `package.json`'s version, hand-write the
changelog, or run `npm publish` yourself. Merge to `main` or `next` and CI
does the rest.

## How it works

- **`main`** → published to the npm `latest` dist-tag, stable releases (e.g. `5.4.0`).
- **`next`** → published to the npm `next` dist-tag, prereleases (e.g. `5.5.0-next.1`).

On every push to either branch, `.github/workflows/release.yml`:

1. Installs, lints, type-checks, tests, and builds.
2. Runs `semantic-release`, which:
   - Analyzes commits since the last release on that branch using
     [Conventional Commits](https://www.conventionalcommits.org/).
   - Computes the next version: `fix:` → patch, `feat:` → minor, `!` or a
     `BREAKING CHANGE:` footer → major.
   - Publishes to npm on the correct dist-tag, with
     [provenance](https://docs.npmjs.com/generating-provenance-statements).
   - Pushes the release tag (`vX.Y.Z`) and creates a GitHub Release with
     generated notes.

If nobody made a `feat:`/`fix:`/breaking commit since the last release,
semantic-release simply does nothing — pushing docs-only or chore commits
does not trigger a release.

**Note:** `main` and `next` require pull requests, which blocks the release
job from pushing a version-bump commit back to those branches (only tags are
exempt from that rule). So `package.json`'s `version` field and
`CHANGELOG.md` are *not* auto-updated in git — the npm registry (dist-tags,
`npm view react-ui-animate versions`) and the GitHub Releases page are the
source of truth for what's actually shipped. If you want the in-repo
changelog back, see the "One-time repository setup" note below.

## Commit message format

Enforced locally by a `commit-msg` hook (commitlint + husky), so a malformed
message is rejected before it ever reaches CI:

- `fix: ...` → patch release
- `feat: ...` → minor release
- `feat!: ...` or a footer `BREAKING CHANGE: ...` → major release
- `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, etc. → no release by
  themselves, but still fine to use

## Promoting a `next` prerelease to `latest`

Merge `next` into `main` (via PR, same as any other change). The next push
to `main` computes and publishes the real release from the accumulated
`feat`/`fix` commits — there's no separate "promote" command.

## One-time repository setup

The only manual step — it can't be done from inside the codebase, it's an
account setting:

- **`NPM_TOKEN`**: create an npm
  [Automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
  for this package and add it as a repository secret named `NPM_TOKEN`
  (Settings → Secrets and variables → Actions). `GITHUB_TOKEN` is provided
  automatically by Actions and needs no setup.

(We looked at giving the release job a PAT to bypass the required-PR rule
and auto-commit `CHANGELOG.md`/`package.json` back to `main`/`next`, but
per-actor bypass of required-PR rules is an org/enterprise-only GitHub
feature — it's not available on a personal-account repo like this one. If
this repo ever moves under an organization, that option becomes available
and `@semantic-release/git` can be re-added to `.releaserc.json`.)

## Local checks

- `npm run release:dry-run` — runs semantic-release without publishing or
  pushing anything, to preview what the next version/notes would be.
- `npm run lint` / `npm run lint:fix`
