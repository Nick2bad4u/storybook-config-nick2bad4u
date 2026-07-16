# Repository Instructions

This repository publishes `storybook-config-nick2bad4u`, a Storybook 10
React/Vite configuration package.

## Public surface

- Keep the root factory, `profiles`, `vite`, and official `preset` subpaths
  usable as ESM imports.
- Keep root `preset.js` as the thin Storybook preset-discovery proxy.
- Treat profile names and addon ordering as public behavior.
- Resolve consumer paths from an explicit project root, never this package's
  install directory.

## Safety and compatibility

- Preserve the consumer's existing Vite plugins, aliases, and optimizeDeps.
- Do not remove or replace the React framework plugins.
- Keep story globs, static directories, and application shims consumer-owned.
- Exercise a real Storybook static build before release.

## Commands

```sh
npm run build:runtime
npm run typecheck
npm test
npm run test:smoke
npm run release:verify
```
