import type { StorybookConfig } from "@storybook/react-vite";
import type { JsonObject } from "type-fest";

import { arrayAt, assertDefined } from "ts-extras";

import {
    createStorybookAddons,
    type StorybookAddon,
    type StorybookProfile,
} from "./profiles.js";
import { createStorybookViteFinal, type StorybookViteOptions } from "./vite.js";

/** Inputs for the React/Vite Storybook configuration factory. */
export interface ReactViteStorybookOptions extends StorybookViteOptions {
    readonly addons?: readonly StorybookAddon[];
    readonly docsName?: string;
    readonly frameworkOptions?: Readonly<JsonObject>;
    readonly profile?: StorybookProfile;
    readonly staticDirs?: readonly string[];
    readonly stories: readonly string[];
}

/**
 * Create a complete React/Vite Storybook configuration.
 *
 * @throws When no consumer-owned story glob is supplied.
 */
export function createReactViteStorybookConfig(
    options: ReactViteStorybookOptions
): StorybookConfig {
    assertDefined(
        arrayAt(options.stories, 0),
        "At least one consumer-owned story glob is required."
    );

    return {
        addons: createStorybookAddons(options.profile, options.addons ?? []),
        docs: {
            defaultName: options.docsName ?? "Docs",
        },
        framework: {
            name: "@storybook/react-vite",
            options: { ...options.frameworkOptions },
        },
        stories: [...options.stories],
        viteFinal: createStorybookViteFinal(options),
        ...(options.staticDirs && { staticDirs: [...options.staticDirs] }),
    } satisfies StorybookConfig;
}

export default createReactViteStorybookConfig;
