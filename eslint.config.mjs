import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // FSD-aligned import ordering + React Compiler / Rules-of-React guard.
  // The `import` and `react-hooks` plugins are already registered by
  // eslint-config-next, so we only add rules here — re-declaring a plugin
  // throws "Cannot redefine plugin". eslint-plugin-react-hooks@7 replaced the
  // single `react-compiler` rule with the granular `recommended-latest` set
  // (set-state-in-render, purity, immutability, …); we enable that set.
  {
    name: 'svoi/best-practice-rules',
    rules: {
      ...reactHooks.configs['recommended-latest'].rules,
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            { pattern: 'react', group: 'external', position: 'before' },
            { pattern: 'react-dom', group: 'external', position: 'before' },
            { pattern: 'next', group: 'external', position: 'before' },
            { pattern: 'next/**', group: 'external', position: 'before' },
            { pattern: '@/shared/**', group: 'internal', position: 'before' },
            { pattern: '@/entities/**', group: 'internal' },
            { pattern: '@/features/**', group: 'internal', position: 'after' },
            { pattern: '@/pages/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // Type-checked rules — need type info via the TypeScript project service.
  // Scoped to TS files: the .mjs config files sit outside the TS project.
  {
    name: 'svoi/type-checked',
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // MUST stay last: turns off stylistic ESLint rules that conflict with Prettier.
  eslintConfigPrettier,
]);

export default eslintConfig;
