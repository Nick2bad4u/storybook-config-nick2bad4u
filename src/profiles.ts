import type { JsonObject } from "type-fest";

/** Addon forms accepted by the shared profile helpers. */
export type StorybookAddon = StorybookAddonObject | string;

/** Object form accepted by Storybook's addons array. */
export interface StorybookAddonObject {
    readonly name: string;
    readonly options?: Readonly<JsonObject>;
}

/** Supported addon bundles. */
export type StorybookProfile =
    | "accessibility"
    | "core"
    | "full"
    | "testing";

/** Addons included by the portable core profile. */
export const coreAddons: readonly StorybookAddon[] = Object.freeze([
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-themes",
]);

/** Addons included by each public profile. */
export const storybookProfiles: Readonly<
    Record<StorybookProfile, readonly StorybookAddon[]>
> = Object.freeze({
    accessibility: Object.freeze([...coreAddons, "@storybook/addon-a11y"]),
    core: coreAddons,
    full: Object.freeze([
        ...coreAddons,
        "@storybook/addon-a11y",
        "@storybook/addon-vitest",
    ]),
    testing: Object.freeze([...coreAddons, "@storybook/addon-vitest"]),
});

const addonKey = (addon: StorybookAddon): string =>
    typeof addon === "string" ? addon : addon.name;

const getProfileAddons = (
    profile: StorybookProfile
): readonly StorybookAddon[] => {
    switch (profile) {
        case "accessibility":
        case "core":
        case "full":
        case "testing": {
            return storybookProfiles[profile];
        }
        default: {
            throw new RangeError("Unknown Storybook profile.");
        }
    }
};

/**
 * Compose one named addon profile with consumer-owned additions.
 *
 * @throws When `profile` is not one of the public profile names.
 */
export function createStorybookAddons(
    profile: StorybookProfile = "core",
    additionalAddons: readonly StorybookAddon[] = []
): StorybookAddon[] {
    const profileAddons = getProfileAddons(profile);
    const seen: Record<string, true> = {};
    return [...profileAddons, ...additionalAddons].filter((addon) => {
        const key = addonKey(addon);
        if (seen[key] === true) {
            return false;
        }

        seen[key] = true;
        return true;
    });
}
