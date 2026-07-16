import { existsSync, readFileSync, rmSync } from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRoot = path.join(repositoryRoot, "test", "fixtures", "storybook");
const configDirectory = path.join(fixtureRoot, ".storybook");
const outputDirectory = path.join(fixtureRoot, "storybook-static");
const require = createRequire(import.meta.url);
const packageJsonPath = require.resolve("storybook/package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const binEntry =
    typeof packageJson.bin === "string"
        ? packageJson.bin
        : packageJson.bin?.storybook;

if (typeof binEntry !== "string") {
    throw new TypeError("The Storybook package does not expose a CLI binary.");
}

const cliPath = path.resolve(path.dirname(packageJsonPath), binEntry);
rmSync(outputDirectory, { force: true, recursive: true });

try {
    const result = spawnSync(
        process.execPath,
        [
            cliPath,
            "build",
            "--config-dir",
            configDirectory,
            "--output-dir",
            outputDirectory,
            "--test",
        ],
        {
            cwd: fixtureRoot,
            encoding: "utf8",
            stdio: "inherit",
        }
    );

    if (result.error !== undefined) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Storybook smoke build exited with ${String(result.status)}.`
        );
    }

    if (!existsSync(path.join(outputDirectory, "index.html"))) {
        throw new Error("Storybook smoke build did not create index.html.");
    }
} finally {
    rmSync(outputDirectory, { force: true, recursive: true });
}
