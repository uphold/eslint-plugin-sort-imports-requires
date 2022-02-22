const buildSortRule = require('../utils/sort-rule-builder');

const getMemberSyntax = (node, options) => {
  // import 'foo'
  if (node.specifiers.length === 0) {
    return 'none';
  }

  // import * as foo from 'foo'
  if (node.specifiers[0].type === 'ImportNamespaceSpecifier') {
    return 'all';
  }

  // import foo from 'foo'
  if (node.specifiers[0].type === 'ImportDefaultSpecifier') {
    return 'single';
  }

  // import { x } from 'foo'
  if (node.specifiers.length === 1 && !options.useOldSingleMemberSyntax) {
    return 'single';
  }

  // import { x, y } from 'foo'
  return 'multiple';
};

const getMemberName = (node, options) => {
  // import 'foo'
  if (!node) {
    return null;
  }

  // import * as foo doesn't have `node.imported`, so we check it here.
  if (!options.useAliases && node.imported) {
    return node.imported.name;
  }

  return node.local.name;
};

const getFirstMemberName = (node, options) => getMemberName(node.specifiers[0], options);

const getMembersWithName = node => node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');

module.exports = buildSortRule(
  'import',
  {
    getFirstMemberName,
    getMemberName,
    getMemberSyntax,
    getMembersWithName
  },
  processNode => ({
    ImportDeclaration: node => {
      processNode(node, 'import');
    }
  })
);
