import type { ESLint, JSRuleDefinition, JSRuleDefinitionTypeOptions } from 'eslint';

export type MemberSyntax = 'none' | 'all' | 'multiple' | 'single';

export interface RuleOptions extends JSRuleDefinitionTypeOptions {
  /** Whether to allow declarations separated by blank lines to form separate groups. */
  allowSeparatedGroups?: boolean;

  /** Whether to ignore case when sorting. */
  ignoreCase?: boolean;

  /** Whether to skip declaration sorting. */
  ignoreDeclarationSort?: boolean;

  /** Whether to skip member sorting within declarations. */
  ignoreMemberSort?: boolean;

  /**
   * The order of member syntax to enforce.
   * - `multiple` refers to multiple named imports/requires (e.g., `import { a, b } from 'module'`).
   * - `single` refers to single named imports/requires (e.g., `import { a } from 'module'`).
   * - `all` refers to all imports/requires regardless of syntax.
   * - `none` means no specific order is enforced.
   */
  memberSyntaxSortOrder?: [MemberSyntax, MemberSyntax, MemberSyntax, MemberSyntax];

  /** Whether to enable autofix for potentially unsafe scenarios. */
  unsafeAutofix?: boolean;

  /** Whether to sort by aliases instead of original names. */
  useAliases?: boolean;

  /** Whether to use the old single member syntax behavior. */
  useOldSingleMemberSyntax?: boolean;
}

declare interface PluginExport extends ESLint.Plugin {
  readonly meta: {
    readonly name: string;
    readonly version: string;
    readonly namespace: string;
  };
  readonly rules: {
    'sort-imports': JSRuleDefinition<RuleOptions>;
    'sort-requires': JSRuleDefinition<RuleOptions>;
  };}

declare const plugin: PluginExport;

export default plugin;
export const meta: PluginExport['meta'];
export const rules: PluginExport['rules'];
