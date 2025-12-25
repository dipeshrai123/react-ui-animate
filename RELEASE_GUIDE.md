# Release Guide

## Version Determination

Since we're using **semantic-release**, version numbers are automatically determined based on commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- **BREAKING CHANGE** or `!` in commit message → **Major version** (e.g., 5.2.0 → 6.0.0)
- `feat:` → **Minor version** (e.g., 5.2.0 → 5.3.0)
- `fix:` → **Patch version** (e.g., 5.2.0 → 5.2.1)

## Current Changes Analysis

Based on the commits since v5.2.0, we have:

### Breaking Changes
- `AnimatePresence` → `Presence` (renamed)
- `inView` → `view` (prop renamed)
- `useMount` hook removed

### New Features
- Animation recipes (40+ pre-built animations)
- `animate` prop
- Low-level drivers exposed
- `Presence` module with hooks
- State animations enhanced
- `makeAnimated` utility

### Bug Fixes
- Multiple fixes for exit animations, state animations, etc.

## Expected Version

Given the breaking changes, semantic-release should determine the next version as **6.0.0**.

However, since we're publishing to the `next` tag, the version will be:
- **6.0.0-next.1** (first prerelease)
- **6.0.0-next.2** (subsequent prereleases)
- etc.

## Publishing Strategy

### Semantic-Release Configuration

The `.releaserc.json` is configured to:
- **`main` branch**: Publishes to `latest` tag (production releases)
- **`next` branch**: Publishes to `next` tag (prerelease versions)

### How to Publish to 'next' Tag

1. **Ensure you're on the `next` branch** (or create it):
   ```bash
   git checkout -b next
   git push origin next
   ```

2. **Run semantic-release** (or use GitHub Actions workflow):
   ```bash
   npx semantic-release
   ```

   Semantic-release will:
   - Analyze commits since last release
   - Determine version (e.g., 6.0.0-next.1)
   - Create git tag
   - Publish to npm with `next` tag
   - Create GitHub release

3. **Verify the release**:
   ```bash
   npm view react-ui-animate@next version
   ```

### Publishing to 'latest' Tag

When ready to promote a prerelease to production:

1. **Merge `next` into `main`**:
   ```bash
   git checkout main
   git merge next
   git push origin main
   ```

2. **Run semantic-release on `main`**:
   - It will publish to `latest` tag
   - Version will be determined from commits (e.g., 6.0.0)

## Important Notes

1. **No manual version in package.json**: Semantic-release manages versions automatically. The version in `package.json` is only used as a fallback and will be updated by semantic-release during the release process.

2. **Commit message format**: Use conventional commits for proper version detection:
   - `feat: add new feature` → minor bump
   - `fix: fix bug` → patch bump
   - `feat!: breaking change` or `BREAKING CHANGE: description` → major bump

3. **Pre-release versions**: When on the `next` branch, semantic-release automatically:
   - Creates prerelease versions (e.g., 6.0.0-next.1)
   - Publishes to the `next` npm tag
   - Does NOT affect the `latest` tag

4. **Testing prereleases**: Users can install prereleases with:
   ```bash
   npm install react-ui-animate@next
   ```

## Current Status

- **Current npm version**: 5.2.0 (latest tag)
- **Expected next version**: 6.0.0-next.1 (next tag)
- **Breaking changes**: Yes (3 breaking changes identified)
- **New features**: Yes (multiple new features)
- **Bug fixes**: Yes (multiple fixes)

## Next Steps

1. ✅ Dependencies updated to latest versions
2. ✅ peerDependencies fixed
3. ✅ CHANGELOG.md created
4. ✅ Semantic-release config updated
5. ⏳ Ready to publish to `next` tag

To publish, ensure you're on the `next` branch and run semantic-release (or trigger the GitHub Actions workflow).

