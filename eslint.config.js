// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'fonts-src/',
      'test-results/',
      'playwright-report/',
      '.lighthouseci/',
      '.wrangler/',
      '.lighthouseci-preview/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
