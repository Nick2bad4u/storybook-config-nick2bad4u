import type { Plugin, UserConfig } from "vite";

import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { addons, viteFinal } from "../src/preset.js";
import { createStorybookAddons, storybookProfiles } from "../src/profiles.js";
import { createReactViteStorybookConfig } from "../src/storybook-config.js";
import { createStorybookViteFinal } from "../src/vite.js";

describe("storybook profiles", () => {
    it("composes stable addon bundles", () => {
        expect.assertions(4);

        expect(storybookProfiles.core).toStrictEqual([
            "@storybook/addon-docs",
            "@storybook/addon-links",
            "@storybook/addon-themes",
        ]);
        expect(storybookProfiles.accessibility).toContain(
            "@storybook/addon-a11y"
        );
        expect(storybookProfiles.testing).toContain("@storybook/addon-vitest");
        expect(storybookProfiles.full).toStrictEqual(
            expect.arrayContaining([
                "@storybook/addon-a11y",
                "@storybook/addon-vitest",
            ])
        );
    });

    it("deduplicates consumer additions by addon name", () => {
        expect.assertions(1);

        expect(
            createStorybookAddons("core", [
                "@storybook/addon-docs",
                { name: "custom-addon", options: { enabled: true } },
                "custom-addon",
            ])
        ).toStrictEqual([
            ...storybookProfiles.core,
            { name: "custom-addon", options: { enabled: true } },
        ]);
    });

    it("rejects unknown runtime profiles", () => {
        expect.assertions(1);

        expect(() => createStorybookAddons("unknown" as never)).toThrow(
            "Unknown Storybook profile."
        );
    });
});

describe("vite integration", () => {
    it("preserves existing plugins while merging aliases and dependencies", () => {
        expect.assertions(3);

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
        expect(result.resolve?.alias).toStrictEqual(
            expect.objectContaining({
                "@": path.join(projectRoot, "src"),
                absolute: "/already/absolute",
                existing: "/existing",
            })
        );
        expect(result.optimizeDeps?.include).toStrictEqual([
            "existing-dependency",
            "shared-dependency",
        ]);
    });

    it("uses a relative base only for production builds", () => {
        expect.assertions(2);

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
        expect.assertions(5);

        const config = createReactViteStorybookConfig({
            addons: ["custom-addon"],
            profile: "accessibility",
            staticDirs: ["../public"],
            stories: ["../src/**/*.stories.tsx"],
        });

        expect(config.stories).toStrictEqual(["../src/**/*.stories.tsx"]);
        expect(config.staticDirs).toStrictEqual(["../public"]);
        expect(config.framework).toStrictEqual({
            name: "@storybook/react-vite",
            options: {},
        });
        expect(config.addons).toStrictEqual(
            expect.arrayContaining(["@storybook/addon-a11y", "custom-addon"])
        );
        expect(config.viteFinal).toBeTypeOf("function");
    });

    it("requires consumer-owned story globs", () => {
        expect.assertions(1);

        expect(() => createReactViteStorybookConfig({ stories: [] })).toThrow(
            "At least one consumer-owned story glob is required."
        );
    });
});

describe("official preset hooks", () => {
    it("reads nested preset options and preserves existing addons", () => {
        expect.assertions(1);

        expect(
            addons(["existing-addon"], {
                options: {
                    additionalAddons: ["additional-addon"],
                    profile: "testing",
                },
            })
        ).toStrictEqual(
            expect.arrayContaining([
                "@storybook/addon-vitest",
                "existing-addon",
                "additional-addon",
            ])
        );
    });

    it("merges Vite configuration through the preset hook", () => {
        expect.assertions(2);

        const result = viteFinal(
            { plugins: [{ name: "existing" }] },
            {
                configType: "PRODUCTION",
                options: { relativeProductionBase: true },
            }
        );

        expect(result.base).toBe("./");
        expect(result.plugins).toStrictEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "existing" }),
            ])
        );
    });

    it("rejects invalid nested preset profiles", () => {
        expect.assertions(1);

        expect(() =>
            addons([], { options: { profile: "invalid" as never } })
        ).toThrow("Unknown Storybook profile.");
    });
});
