# storybook-config-nick2bad4u

[![CI](https://github.com/Nick2bad4u/storybook-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/storybook-config-nick2bad4u/actions/workflows/ci.yml)

Composable Storybook 10 presets and factories for React projects using the
Vite builder. The package supplies portable addon profiles and conservative
Vite merging while leaving story globs, static assets, application aliases,
and framework shims under consumer control.

## Install

```sh
npm install --save-dev \
  storybook @storybook/react-vite vite react react-dom \
  storybook-config-nick2bad4u
```

## React/Vite factory

Create `.storybook/main.ts` with explicit paths owned by the application:

```ts
import { createReactViteStorybookConfig } from "storybook-config-nick2bad4u";

export default createReactViteStorybookConfig({
 aliases: {
  "@": "src",
 },
 profile: "accessibility",
 projectRoot: new URL("..", import.meta.url).pathname,
 staticDirs: ["../public"],
 stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
});
```

The factory selects `@storybook/react-vite`, enables the selected addon
profile, and merges a `viteFinal` hook without deleting React or consumer Vite
plugins.

## Addon profiles

- `core` — docs, links, and themes.
- `accessibility` — core plus the accessibility addon.
- `testing` — core plus the Vitest addon.
- `full` — core, accessibility, and Vitest.

Additional addons are deduplicated by package name:

```ts
import { createStorybookAddons } from "storybook-config-nick2bad4u/profiles";

const addons = createStorybookAddons("full", ["my-storybook-addon"]);
```

## Storybook preset form

Storybook can also discover the package through its root `preset.js` proxy:

```ts
export default {
 addons: [
  {
   name: "storybook-config-nick2bad4u",
   options: {
    profile: "accessibility",
    projectRoot: new URL("..", import.meta.url).pathname,
    aliases: { "@": "src" },
   },
  },
 ],
 framework: "@storybook/react-vite",
 stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
};
```

The same hooks are available explicitly from
`storybook-config-nick2bad4u/preset`.

## Vite merge

Use the focused subpath when an existing Storybook config only needs shared
Vite behavior:

```ts
import { createStorybookViteFinal } from "storybook-config-nick2bad4u/vite";

export default {
 viteFinal: createStorybookViteFinal({
  optimizeDepsInclude: ["some-esm-only-library"],
  projectRoot: new URL("..", import.meta.url).pathname,
  relativeProductionBase: true,
 }),
};
```

Relative aliases resolve from `projectRoot`. Existing aliases, optimizeDeps,
and plugins are retained. A relative `./` base is used only for Storybook
production builds and only when explicitly requested.

## Validation

```sh
npm run release:verify
```

The release gate builds and type-checks with both supported TypeScript
generations, runs unit and coverage checks, performs a real Storybook static
build, and validates the packed ESM/type surface.

## License

[MIT](LICENSE)
