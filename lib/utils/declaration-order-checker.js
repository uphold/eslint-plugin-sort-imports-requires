const once = require('once');

const getNumberOfLinesBetween = (left, right) => Math.max(right.loc.start.line - left.loc.end.line, 0);

const isFixable = ({ context, declarations, options }) => {
  // Changing declaration order is unsafe because they might have side-effects, so the order
  // in which they are executed might be important.
  if (!options.unsafeAutofix) {
    return false;
  }

  const sourceCode = context.getSourceCode();

  // We can only fix if every declaration doesn't have an associated comment.
  return declarations.every((declaration, index) => {
    const commentsBefore = sourceCode.getCommentsBefore(declaration);
    const commentBefore = commentsBefore[commentsBefore.length - 1];
    const [commentAfter] = sourceCode.getCommentsAfter(declaration);

    let hasCommentBefore;
    let hasCommentAfter;

    // If only one group is allowed:
    // - Every declaration must not have any comment before, except for the first one if it has two or more new lines in between.
    // - Every declaration must not have any comment after, except the last one if it has one or more new lines in between.
    // If multiple groups are allowed:
    // - Every declaration can only have a comment before if they are on a new line.
    // - Every declaration can only have a comment after if they are on a new line.
    if (!options.allowSeparatedGroups) {
      hasCommentBefore =
        index === 0 ? !!commentBefore && getNumberOfLinesBetween(commentBefore, declaration) <= 1 : !!commentBefore;
      hasCommentAfter =
        index === declarations.length - 1
          ? !!commentAfter && getNumberOfLinesBetween(declaration, commentAfter) <= 0
          : !!commentAfter;
    } else {
      hasCommentBefore = !!commentBefore && getNumberOfLinesBetween(commentBefore, declaration) <= 0;
      hasCommentAfter = !!commentAfter && getNumberOfLinesBetween(declaration, commentAfter) <= 0;
    }

    return !hasCommentBefore && !hasCommentAfter;
  });
};

const buildGetFirstMemberSortableName = ({ options, ruleTypeFns }) => {
  const { getFirstMemberName } = ruleTypeFns;

  return options.ignoreCase
    ? member => getFirstMemberName(member, options).toLowerCase()
    : member => getFirstMemberName(member, options);
};

const buildDeclarationFix = ({ context, declarations, ruleTypeFns, options }) => {
  // Split by groups.
  const groups = !options.allowSeparatedGroups
    ? [declarations]
    : declarations.reduce(
        (groups, declaration, index) => {
          const previousDeclaration = declarations[index - 1];

          if (previousDeclaration && getNumberOfLinesBetween(previousDeclaration, declaration) >= 2) {
            groups.push([declaration]);
          } else {
            groups[Math.max(0, groups.length - 1)].push(declaration);
          }

          return groups;
        },
        [[]]
      );

  // Check if we can fix at least one group. If not, return null so that the fixing is unavailable in editors.
  const groupsFixable = groups.map(declarations => isFixable({ context, declarations, options }));
  const canFixAtLeastOneGroup = groupsFixable.some(canFix => canFix);

  if (!canFixAtLeastOneGroup) {
    return null;
  }

  // Just run the fixer once because it fixes all declarations at the same time.
  // Running it multiple times for every declaration would be a waste of CPU cycles.
  return once(fixer => {
    const { getMemberSyntax } = ruleTypeFns;
    const sourceCode = context.getSourceCode();
    const getSortableName = buildGetFirstMemberSortableName({ options, ruleTypeFns });

    // Sort declarations on each group & generate the final string to be replaced.
    return fixer.replaceTextRange(
      [declarations[0].range[0], declarations[declarations.length - 1].range[1]],
      groups
        .map((declarations, index) => {
          const canFix = groupsFixable[index];

          // Sort each declaration within the group.
          const newDeclarations = !canFix
            ? declarations
            : declarations.slice().sort((declarationA, declarationB) => {
                // Sort first by member syntax.
                const memberASyntaxGroupIndex = options.memberSyntaxSortOrder.indexOf(
                  getMemberSyntax(declarationA, options)
                );
                const memberBSyntaxGroupIndex = options.memberSyntaxSortOrder.indexOf(
                  getMemberSyntax(declarationB, options)
                );

                if (memberASyntaxGroupIndex !== memberBSyntaxGroupIndex) {
                  return memberASyntaxGroupIndex > memberBSyntaxGroupIndex ? 1 : -1;
                }

                // Then sort by first member name.
                const nameA = getSortableName(declarationA);
                const nameB = getSortableName(declarationB);

                // Case in which names are equal (e.g.: both are null).
                if (nameA === nameB) {
                  return 0;
                }

                return nameA > nameB ? 1 : -1;
              });

          // Build a string out of the sorted list of import specifiers and the text between the originals.
          return newDeclarations.reduce((sourceText, declaration, index) => {
            const textAfterSpecifier =
              index === declarations.length - 1
                ? ''
                : sourceCode.getText().slice(declarations[index].range[1], declarations[index + 1].range[0]);

            return sourceText + sourceCode.getText(declaration) + textAfterSpecifier;
          }, '');
        })
        .reduce((sourceText, groupSourceText, index) => {
          const textAfterSpecifier =
            index === groups.length - 1
              ? ''
              : sourceCode
                  .getText()
                  .slice(groups[index][groups[index].length - 1].range[1], groups[index + 1][0].range[0]);

          return sourceText + groupSourceText + textAfterSpecifier;
        }, '')
    );
  });
};

const checkDeclarationSort = ({ context, declarations, options, ruleTypeFns }) => {
  const { getMemberSyntax, getFirstMemberName } = ruleTypeFns;
  let previousDeclaration = null;

  const fix = buildDeclarationFix({ context, declarations, options, ruleTypeFns });

  declarations.forEach(declaration => {
    // Reset declaration sort if `allowSeparatedGroups` is enabled and there are lines in between.
    if (
      previousDeclaration &&
      options.allowSeparatedGroups &&
      getNumberOfLinesBetween(previousDeclaration, declaration) >= 2
    ) {
      previousDeclaration = null;
    }

    if (previousDeclaration) {
      const currentMemberSyntaxGroupIndex = options.memberSyntaxSortOrder.indexOf(
        getMemberSyntax(declaration, options)
      );
      const previousMemberSyntaxGroupIndex = options.memberSyntaxSortOrder.indexOf(
        getMemberSyntax(previousDeclaration, options)
      );

      // When the current declaration uses a different member syntax, then check if the ordering is correct.
      // Otherwise, check if the declaration members ordering is correct.
      if (currentMemberSyntaxGroupIndex !== previousMemberSyntaxGroupIndex) {
        if (currentMemberSyntaxGroupIndex < previousMemberSyntaxGroupIndex) {
          context.report({
            data: {
              syntaxA: options.memberSyntaxSortOrder[currentMemberSyntaxGroupIndex],
              syntaxB: options.memberSyntaxSortOrder[previousMemberSyntaxGroupIndex]
            },
            fix,
            messageId: 'unexpectedSyntaxOrder',
            node: declaration
          });
        }
      } else {
        const currentMemberName = getFirstMemberName(declaration, options);
        const previousMemberName = getFirstMemberName(previousDeclaration, options);

        const currentMemberSortableName = options.ignoreCase ? currentMemberName?.toLowerCase() : currentMemberName;
        const previousMemberSortableName = options.ignoreCase ? previousMemberName?.toLowerCase() : previousMemberName;

        if (currentMemberSortableName < previousMemberSortableName) {
          context.report({
            data: {
              currentMemberName,
              previousMemberName
            },
            fix,
            messageId: 'sortImportsAlphabetically',
            node: declaration
          });
        }
      }
    }

    previousDeclaration = declaration;
  });
};

module.exports = checkDeclarationSort;
