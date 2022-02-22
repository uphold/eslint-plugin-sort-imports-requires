const buildSortRule = require('../utils/sort-rule-builder');

const isTopLevel = node => node.parent.type === 'Program';

const isStaticRequire = node =>
  node.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  node.callee.name === 'require' &&
  node.arguments.length === 1;

const isRequire = node => node.type === 'VariableDeclaration' && node.declarations[0].init?.callee?.name === 'require';

const hasVariableDeclarations = node => !!node.declarations;

const hasObjectPattern = node => node.declarations?.[0].id?.type === 'ObjectPattern';

const hasMultipleProperties = node => node.declarations?.[0].id?.properties.length > 1;

const getMemberName = (node, options) => {
  // const { ...a } = require('foo');
  if (node.type === 'RestElement') {
    return node.argument.name;
  }

  // const { [getFoo(): foo ] } doesn't have a `key.value` worth using, so we check it here.
  if (!options.useAliases && node.key.name) {
    return node.key.name;
  }

  return node.value.name;
};

const getMemberSyntax = (node, options) => {
  // require()
  if (!hasVariableDeclarations(node)) {
    return 'none';
  }

  // const x = require('foo')
  if (!hasObjectPattern(node)) {
    return 'single';
  }

  // const { x } = require('foo')
  if (!hasMultipleProperties(node) && !options.useOldSingleMemberSyntax) {
    return 'single';
  }

  // const { x, y } = require('foo')
  return 'multiple';
};

const getFirstMemberName = (node, options) => {
  // require('foo')
  if (!hasVariableDeclarations(node)) {
    return null;
  }

  // const { x } = require('foo')
  if (hasObjectPattern(node)) {
    return getMemberName(node.declarations[0].id.properties[0], options);
  }

  // const x = require('foo')
  return node.declarations[0].id.name ?? null;
};

const getMembersWithName = node =>
  hasVariableDeclarations(node) && hasObjectPattern(node) ? node.declarations[0].id.properties : [];

module.exports = buildSortRule(
  'require',
  {
    getFirstMemberName,
    getMemberName,
    getMemberSyntax,
    getMembersWithName
  },
  processNode => ({
    ExpressionStatement: node => {
      if (!isTopLevel(node) || !isStaticRequire(node.expression)) {
        return;
      }

      processNode(node);
    },
    VariableDeclaration: node => {
      if (!isTopLevel(node) || !isRequire(node)) {
        return;
      }

      processNode(node);
    }
  })
);
