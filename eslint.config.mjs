import nickTwoBadFourU from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.all,

    // Storybook resolves this package-level proxy before built exports.
    {
        files: ["preset.js"],
        rules: {
            "canonical/no-export-all": "off",
            "canonical/no-re-export": "off",
            "no-barrel-files/no-barrel-files": "off",
        },
    },
];

export default config;
