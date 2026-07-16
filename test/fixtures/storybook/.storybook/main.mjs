import { createReactViteStorybookConfig } from "../../../../dist/storybook-config.js";

export default createReactViteStorybookConfig({
    aliases: { "@fixture": "src" },
    profile: "core",
    projectRoot: new URL("..", import.meta.url).pathname,
    relativeProductionBase: true,
    stories: ["../src/**/*.stories.mjs"],
});
