import type { Plugin, UserConfig } from "vite";

import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addons, viteFinal } from "../src/preset.js";
import { createStorybookAddons, storybookProfiles } from "../src/profiles.js";
import { createReactViteStorybookConfig } from "../src/storybook-config.js";
import { createStorybookViteFinal } from "../src/vite.js";

describe("storybook profiles", () => {
    it("composes stable addon bundles", () => {
        expect(storybookProfiles.core).toEqual([
            "@storybook/addon-docs",
            "@storybook/addon-links",
            "@storybook/addon-themes",
        ]);
        expect(storybookProfiles.accessibility).toContain(
            "@storybook/addon-a11y"
        );
        expect(storybookProfiles.testing).toContain("@storybook/addon-vitest");
        expect(storybookProfiles.full).toEqual(
            expect.arrayContaining([
                "@storybook/addon-a11y",
                "@storybook/addon-vitest",
            ])
        );
    });

    it("deduplicates consumer additions by addon name", () => {
        expect(
            createStorybookAddons("core", [
                "@storybook/addon-docs",
                { name: "custom-addon", options: { enabled: true } },
                "custom-addon",
            ])
        ).toEqual([
            ...storybookProfiles.core,
            { name: "custom-addon", options: { enabled: true } },
        ]);
    });

    it("rejects unknown runtime profiles", () => {
        expect(() => createStorybookAddons("unknown" as never)).toThrow(
            "Unknown Storybook profile."
        );
    });
});

describe("vite integration", () => {
    it("preserves existing plugins while merging aliases and dependencies", () => {
        const existingPlugin: Plugin = { name: "existing-react-plugin" };
        const projectRoot = path.resolve("test/fixtures/application");
        const initialConfig: UserConfig = {
            optimizeDeps: { include: ["existing-dependency"] },
            plugins: [existingPlugin],
            resolve: { alias: { existing: "/existing" } },
        };
        const result = createStorybookViteFinal({
            aliases: { "@": "src", absolute: "/already/absolute" },
            optimizeDepsInclude: ["shared-dependency"],
            projectRoot,
        })(initialConfig, { configType: "DEVELOPMENT" });

        expect(result.plugins).toContain(existingPlugin);
        expect(result.resolve?.alias).toEqual(
            expect.objectContaining({
                "@": path.join(projectRoot, "src"),
                absolute: "/already/absolute",
                existing: "/existing",
            })
        );
        expect(result.optimizeDeps?.include).toEqual([
            "existing-dependency",
            "shared-dependency",
        ]);
    });

    it("uses a relative base only for production builds", () => {
        const finalizer = createStorybookViteFinal({
            relativeProductionBase: true,
        });

        expect(
            finalizer({}, { configType: "DEVELOPMENT" }).base
        ).toBeUndefined();
        expect(finalizer({}, { configType: "PRODUCTION" }).base).toBe("./");
    });
});

describe("react/Vite configuration", () => {
    it("creates a complete config while leaving app paths explicit", () => {
        const config = createReactViteStorybookConfig({
            addons: ["custom-addon"],
            profile: "accessibility",
            staticDirs: ["../public"],
            stories: ["../src/**/*.stories.tsx"],
        });

        expect(config.stories).toEqual(["../src/**/*.stories.tsx"]);
        expect(config.staticDirs).toEqual(["../public"]);
        expect(config.framework).toEqual({
            name: "@storybook/react-vite",
            options: {},
        });
        expect(config.addons).toEqual(
            expect.arrayContaining(["@storybook/addon-a11y", "custom-addon"])
        );
        expect(config.viteFinal).toBeTypeOf("function");
    });

    it("requires consumer-owned story globs", () => {
        expect(() => createReactViteStorybookConfig({ stories: [] })).toThrow(
            "At least one consumer-owned story glob is required."
        );
    });
});

describe("official preset hooks", () => {
    it("reads nested preset options and preserves existing addons", () => {
        expect(
            addons(["existing-addon"], {
                options: {
                    additionalAddons: ["additional-addon"],
                    profile: "testing",
                },
            })
        ).toEqual(
            expect.arrayContaining([
                "@storybook/addon-vitest",
                "existing-addon",
                "additional-addon",
            ])
        );
    });

    it("merges Vite configuration through the preset hook", () => {
        const result = viteFinal(
            { plugins: [{ name: "existing" }] },
            {
                configType: "PRODUCTION",
                options: { relativeProductionBase: true },
            }
        );

        expect(result.base).toBe("./");
        expect(result.plugins).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "existing" }),
            ])
        );
    });

    it("rejects invalid nested preset profiles", () => {
        expect(() =>
            addons([], { options: { profile: "invalid" as never } })
        ).toThrow("Unknown Storybook profile.");
    });
});
