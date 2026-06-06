import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 12,
        sourceType: "module",
    },

    rules: {
        "semi-style": ["error", "last"],

        "semi-spacing": ["warn", {
            before: false,
            after: true,
        }],

        "no-extra-semi": "warn",
        "member-ordering": "off",
        "object-curly-spacing": "warn",
        "no-prototype-builtins": "off",
        "no-case-declarations": "warn",
        "prefer-const": "warn",
        "max-len": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-function": "off",

        "@typescript-eslint/naming-convention": ["warn", {
            selector: "interface",
            format: ["PascalCase"],
        }, {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE", "PascalCase", "snake_case"],
            leadingUnderscore: "allow",
        }],

        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
    },
}]);
