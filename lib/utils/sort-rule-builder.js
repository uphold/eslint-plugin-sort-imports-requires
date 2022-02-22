const checkDeclarationOrder = require('./declaration-order-checker');
const checkMemberSort = require('./members-order-checker');

const buildSortRule = (ruleType, ruleTypeFns, processNode) => ({
  create: context => {
    const options = {
      allowSeparatedGroups: false,
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      unsafeAutofix: false,
      useAliases: true,
      useOldSingleMemberSyntax: false,
      ...(context.options[0] ?? {})
    };

    const declarations = [];

    const handleNode = node => {
      declarations.push(node);
    };

    const handleProgramExit = () => {
      if (!options.ignoreDeclarationSort) {
        checkDeclarationOrder({ context, declarations, options, ruleTypeFns });
      }

      if (!options.ignoreMemberSort) {
        checkMemberSort({ context, declarations, options, ruleTypeFns });
      }
    };

    return {
      ...processNode(handleNode),
      'Program:exit': handleProgramExit
    };
  },
  meta: {
    /* eslint-disable sort-keys */
    type: 'suggestion',
    docs: {
      description: `enforce sorted ${ruleType} declarations within modules`,
      recommended: false,
      url: 'https://github.com/uphold/eslint-plugin-sort-imports-requires#supported-rules'
    },

    schema: [
      {
        type: 'object',
        properties: {
          ignoreCase: {
            type: 'boolean',
            default: false
          },
          memberSyntaxSortOrder: {
            type: 'array',
            items: {
              enum: ['none', 'all', 'multiple', 'single']
            },
            uniqueItems: true,
            minItems: 4,
            maxItems: 4
          },
          ignoreDeclarationSort: {
            type: 'boolean',
            default: false
          },
          ignoreMemberSort: {
            type: 'boolean',
            default: false
          },
          allowSeparatedGroups: {
            type: 'boolean',
            default: false
          },
          unsafeAutofix: {
            type: 'boolean',
            default: false
          },
          useOldSingleMemberSyntax: {
            type: 'boolean',
            default: false
          },
          useAliases: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],

    fixable: 'code',

    messages: {
      sortImportsAlphabetically: `Expected ${ruleType} declaration of '{{currentMemberName}}' to be placed before '{{previousMemberName}}'.`,
      sortMembersAlphabetically: `Member '{{memberName}}' of the ${ruleType} declaration should be sorted alphabetically.`,
      unexpectedSyntaxOrder: `Expected ${ruleType} declaration of '{{syntaxA}}' syntax to be placed before '{{syntaxB}}' syntax.`
    }
    /* eslint-enable sort-keys */
  }
});

module.exports = buildSortRule;
