// @ts-check
// Harness ESLint config for Angular (flat config, angular-eslint + typescript-eslint + prettier), adapted for OpenBando.
// Keep project rules that do not contradict AGENTS.md.
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularEslint from 'angular-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { readFileSync } from 'node:fs';

// The copied harness tools stay byte-identical to the template: ignore them by path, lint the project's own tools.
const copied = Object.keys(JSON.parse(readFileSync(new URL('./.harness.json', import.meta.url), 'utf8')).copied);

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.angular/**',
      'coverage/**',
      // where CI checks the harness template out
      '.harness/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
      'library/**',
      'docs/**',
      // throwaway experiments that reach into Angular's debug API (window.ng); not maintained code
      'tools/prototypes/**',
      ...copied,
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    extends: [...angularEslint.configs.tsRecommended],
    processor: angularEslint.processInlineTemplates,
    rules: {
      // OnPush and standalone are the defaults in Angular v22: do not require them explicitly (AGENTS.md).
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/prefer-inject': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // core/ stays plain TypeScript: from Angular only the signal primitives, which run without the framework
    // (AGENTS.md, Architecture; check:conventions enforces the same).
    files: ['src/app/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              allowImportNames: ['signal', 'computed', 'untracked'],
              message: 'core/ imports only signal, computed and untracked from Angular.',
            },
          ],
          patterns: [{ group: ['@angular/*', '!@angular/core'], message: 'This layer must stay framework-free.' }],
        },
      ],
    },
  },
  {
    // Node scripts: the project's own tools and the Playwright tests' helpers
    files: ['tools/**/*.{mjs,js,ts}', 'e2e/**/*.ts', '*.{mjs,js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['src/**/*.html'],
    extends: [...angularEslint.configs.templateRecommended, ...angularEslint.configs.templateAccessibility],
    rules: {},
  },
  prettierConfig,
);
