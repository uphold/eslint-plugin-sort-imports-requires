const { hasSideEffect } = require('eslint-utils');

const isFixable = ({ context, members, options }) => {
  const sourceCode = context.getSourceCode();

  // It's considered unsafe if one of the members has a side-effect, e.g.: { [foo()]: bar }
  if (!options.unsafeAutofix) {
    const hasNoSideEffects = members.every(member => !hasSideEffect(member, sourceCode));

    if (!hasNoSideEffects) {
      return false;
    }
  }

  // We can only fix if every member doesn't have an associated comment.
  return members.every(member => {
    const hasCommentBefore = sourceCode.getCommentsBefore(member).length > 0;
    const hasCommentAfter = sourceCode.getCommentsAfter(member).length > 0;

    return !hasCommentBefore && !hasCommentAfter;
  });
};

const buildGetMemberSortableName = ({ options, ruleTypeFns }) => {
  const { getMemberName } = ruleTypeFns;

  return options.ignoreCase
    ? member => getMemberName(member, options).toLowerCase()
    : member => getMemberName(member, options);
};

const buildMemberSortFixer = ({ context, declaration, options, ruleTypeFns }) => {
  const { getMembersWithName } = ruleTypeFns;
  const members = getMembersWithName(declaration, options);

  if (!isFixable({ context, members, options })) {
    return null;
  }

  return fixer => {
    const sourceCode = context.getSourceCode();
    const getSortableName = buildGetMemberSortableName({ options, ruleTypeFns });

    return fixer.replaceTextRange(
      [members[0].range[0], members[members.length - 1].range[1]],
      members
        // Clone the members array to avoid mutating it.
        .slice()
        // Sort the array into the desired order.
        .sort((memberA, memberB) => {
          const nameA = getSortableName(memberA);
          const nameB = getSortableName(memberB);

          return nameA > nameB ? 1 : -1;
        })
        // Build a string out of the sorted list of import specifiers and the text between the originals.
        .reduce((sourceText, member, index) => {
          const textAfterSpecifier =
            index === members.length - 1
              ? ''
              : sourceCode.getText().slice(members[index].range[1], members[index + 1].range[0]);

          return sourceText + sourceCode.getText(member) + textAfterSpecifier;
        }, '')
    );
  };
};

const checkMemberSort = ({ context, declarations, options, ruleTypeFns }) => {
  const { getMembersWithName, getMemberName } = ruleTypeFns;

  declarations.forEach(declaration => {
    // Check if there's a member out of order.
    const members = getMembersWithName(declaration, options);
    const getSortableName = buildGetMemberSortableName({ options, ruleTypeFns });

    const firstUnsortedIndex = members.map(getSortableName).findIndex((name, index, array) => array[index - 1] > name);

    if (firstUnsortedIndex === -1) {
      return;
    }

    context.report({
      data: {
        memberName: getMemberName(members[firstUnsortedIndex], options)
      },
      fix: buildMemberSortFixer({ context, declaration, options, ruleTypeFns }),
      messageId: 'sortMembersAlphabetically',
      node: members[firstUnsortedIndex]
    });
  });
};

module.exports = checkMemberSort;
