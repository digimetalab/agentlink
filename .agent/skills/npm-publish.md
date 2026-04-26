# Skill: npm publish workflow

When the user asks to publish to npm:
1. Always run `npm test` first — abort if any test fails
2. Run `npm run build` and verify dist/ contains .js, .d.ts, .mjs files
3. Check package.json version — suggest bumping using semver
4. Run `npm pack --dry-run` to show what will be published
5. Ask for confirmation before running `npm publish`
6. After publish, create a git tag: `git tag v{version} && git push --tags`
7. User's npm username is: digimetalab
