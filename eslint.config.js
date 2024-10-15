const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const js = require('@eslint/js');
const sortImportsRequires = require('.');

module.exports = [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'sort-imports-requires': sortImportsRequires
    },
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
    },
    languageOptions: {
      globals: globals.node
    }
  }
];
