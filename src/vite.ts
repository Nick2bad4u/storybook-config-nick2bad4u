import * as path from "node:path";
import { objectKeys, objectMapValues } from "ts-extras";
import { mergeConfig, type UserConfig } from "vite";

/** Storybook fields passed to `viteFinal` hooks. */
export interface StorybookViteContext {
    readonly configType?: "DEVELOPMENT" | "PRODUCTION";
}

/** A Vite finalizer compatible with Storybook's Vite builder. */
export type StorybookViteFinal = (
    config: UserConfig,
    context?: StorybookViteContext
) => UserConfig;

/** Portable Vite changes supplied by this package. */
export interface StorybookViteOptions {
    readonly aliases?: Readonly<Record<string, string>>;
    readonly optimizeDepsInclude?: readonly string[];
    readonly projectRoot?: string;
    readonly relativeProductionBase?: boolean;
}

const resolveAliases = (
    aliases: Readonly<Record<string, string>>,
    projectRoot: string
): Record<string, string> =>
    objectMapValues(
        aliases,
        (target) =>
            path.isAbsolute(target)
                ? target
                : path.resolve(projectRoot, target),
        { strict: false }
    ) as Record<string, string>;

/** Create a Vite finalizer that merges without removing framework plugins. */
export function createStorybookViteFinal(
    options: StorybookViteOptions = {}
): StorybookViteFinal {
    return (config, context = {}) => {
        const projectRoot = path.resolve(
            options.projectRoot ?? config.root ?? process.cwd()
        );
        const aliases = resolveAliases(options.aliases ?? {}, projectRoot);
        const optimizeDepsInclude = [...(options.optimizeDepsInclude ?? [])];
        const sharedConfig: UserConfig = {};

        if (objectKeys(aliases).length > 0) {
            sharedConfig.resolve = { alias: aliases };
        }

        if (optimizeDepsInclude.length > 0) {
            sharedConfig.optimizeDeps = { include: optimizeDepsInclude };
        }

        if (
            options.relativeProductionBase === true &&
            context.configType === "PRODUCTION"
        ) {
            sharedConfig.base = "./";
        }

        return mergeConfig(config, sharedConfig);
    };
}
