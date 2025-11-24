import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const compat = new FlatCompat();

export default [
  // Next.js base config
  ...nextVitals,
  ...nextTs,

  // TypeScript strict
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Parser configuration pour type-aware linting
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Custom rules
  {
    rules: {
      // Variables non utilisées avec pattern intelligent
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],

      // TypeScript best practices
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-non-null-assertion": "error",

      // Code quality
      "prefer-const": "error",
      "prefer-template": "error",
      "no-console": "warn",
      "no-nested-ternary": "off",

      // Désactiver les règles Next.js trop strictes
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",

      // Désactiver certaines règles TypeScript trop strictes
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },

  // Allow console inside logger utility
  {
    files: ["lib/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },

  // Ignores
  {
    ignores: [
      ".next/**",
      ".vercel/**",
      ".claude/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "*.js",
      "*.mjs",
    ],
  },
];
