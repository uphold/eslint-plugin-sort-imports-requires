const buildSortRule = require('../utils/sort-rule-builder');

const getCallExpression = node => {
  if (!node) {
    return null;
  }

  // If it's a MemberExpression keep recursing..
  // require('foo').foo.bar
  if (node.type === 'MemberExpression') {
    return getCallExpression(node.object);
  }

  // If it's a CallExpression keep recursing, but return itself in case there's no child CallExpression.
  // require('foo')('foo')('bar')
  if (node.type === 'CallExpression') {
    return getCallExpression(node.callee) ?? node;
  }

  return null;
};

const isTopLevel = node => node.parent.type === 'Program';

const isRequireCallExpression = node => {
  const callExpression = getCallExpression(node);

  return (
    !!callExpression &&
    callExpression.callee.type === 'Identifier' &&
    callExpression.callee.name === 'require' &&
    callExpression.arguments.length === 1
  );
};

const isRequireVariableDeclaration = node =>
  node.type === 'VariableDeclaration' && isRequireCallExpression(node.declarations[0].init);

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

  // Return value.name, falling back to key.name.
  // value.name is undefined in case of nested destructuring, like const { x: { y } } = require('foo')
  return node.value.name ?? node.key.name;
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
      if (!isTopLevel(node) || !isRequireCallExpression(node.expression)) {
        return;
      }

      processNode(node);
    },
    VariableDeclaration: node => {
      if (!isTopLevel(node) || !isRequireVariableDeclaration(node)) {
        return;
      }

      processNode(node);
    }
  })
);
