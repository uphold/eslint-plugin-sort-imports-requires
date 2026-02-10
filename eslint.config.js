const { defineConfig } = require('eslint/config');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const js = require('@eslint/js');
const sortImportsRequires = require('./lib/index.js');

module.exports = defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs'
    },
    plugins: {
      'sort-imports-requires': sortImportsRequires
    },
    name: 'eslint-plugin-sort-imports-requires/eslint-config',
    rules: {
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'avoid',
          printWidth: 120,
          singleQuote: true,
          trailingComma: 'none'
        }
      ],
      'sort-imports-requires/sort-imports': ['error', { unsafeAutofix: true }],
      'sort-imports-requires/sort-requires': ['error', { unsafeAutofix: true }]
    }
  },
  eslintPluginPrettierRecommended
]);
