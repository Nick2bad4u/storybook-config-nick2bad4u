import type { UserConfig } from "vite";

import {
    createStorybookAddons,
    type StorybookAddon,
    type StorybookProfile,
} from "./profiles.js";
import {
    createStorybookViteFinal,
    type StorybookViteContext,
    type StorybookViteOptions,
} from "./vite.js";

/** Runtime shape supplied to Storybook preset hooks. */
export interface SharedStorybookPresetContext
    extends SharedStorybookPresetOptions, StorybookViteContext {
    readonly options?: SharedStorybookPresetOptions;
}

/** Options accepted when this package is loaded as a Storybook preset. */
export interface SharedStorybookPresetOptions extends StorybookViteOptions {
    readonly additionalAddons?: readonly StorybookAddon[];
    readonly profile?: StorybookProfile;
}

const getPresetOptions = (
    context: SharedStorybookPresetContext
): SharedStorybookPresetOptions => context.options ?? context;

/** Storybook preset hook that contributes the selected addon profile. */
export function addons(
    existingAddons: readonly StorybookAddon[] = [],
    context: SharedStorybookPresetContext = {}
): StorybookAddon[] {
    const options = getPresetOptions(context);
    return createStorybookAddons(options.profile, [
        ...existingAddons,
        ...(options.additionalAddons ?? []),
    ]);
}

/** Storybook preset hook that applies this package's safe Vite merge. */
export function viteFinal(
    config: Readonly<UserConfig>,
    context: SharedStorybookPresetContext = {}
): UserConfig {
    const options = getPresetOptions(context);
    return createStorybookViteFinal(options)(config, context);
}
