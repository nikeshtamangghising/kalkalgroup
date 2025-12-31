const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'build/**', 'dist/**']
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Production-optimized ESLint configuration
      // Critical errors that should always be caught
      'no-debugger': 'error',
      'no-console': 'warn', // Warn about console statements

      // TypeScript rules - enabled as warnings for better code quality
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn about any types
      '@typescript-eslint/no-require-imports': 'off', // Allow require for config files
      '@typescript-eslint/triple-slash-reference': 'off', // Next.js generates these
      '@typescript-eslint/no-empty-object-type': 'off', // Allow empty interfaces

      // React rules - enabled as warnings
      'react/no-unescaped-entities': 'warn',
      'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies

      // Next.js rules
      '@next/next/no-img-element': 'warn', // Prefer next/image

      // JavaScript rules - critical errors only
      'prefer-const': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-var': 'error', // Enforce let/const over var
      'eqeqeq': ['error', 'always'], // Require === and !==
    },

    // Environment-specific overrides
    languageOptions: {
      globals: {
        // Add any global variables your project uses
        React: 'readonly',
        JSX: 'readonly'
      }
    }
  }
];
