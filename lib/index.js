const { name, version } = require('../package.json');

/**
 * ESLint plugin sort-imports-requires.
 * @type {import('eslint').ESLint.Plugin}
 */
module.exports = Object.freeze({
  meta: {
    name,
    version,
    namespace: 'sort-imports-requires'
  },
  rules: {
    'sort-imports': require('./rules/sort-imports'),
    'sort-requires': require('./rules/sort-requires')
  }
});
