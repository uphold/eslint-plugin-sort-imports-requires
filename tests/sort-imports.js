const rule = require('../lib').rules['sort-imports'];
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
});

ruleTester.run('sort', rule, {
  invalid: [
    // Declaration sort - default options.
    {
      code: `
        import a from 'foo';
        import A from 'foo';
        import c from 'foo';
      `,
      errors: [{ message: "Expected import declaration of 'A' to be placed before 'a'.", type: 'ImportDeclaration' }]
    },
    {
      code: `
        import b from 'foo';
        import a from 'foo';
      `,
      errors: [{ message: "Expected import declaration of 'a' to be placed before 'b'.", type: 'ImportDeclaration' }]
    },
    {
      code: `
        import a from 'foo';
        import 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ]
    },
    {
      code: `
        import a from 'foo';
        import * as b from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'all' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ]
    },
    {
      code: `
        import c from 'foo';
        import { a, b } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ]
    },
    {
      code: `
        import c, { a, b } from 'foo';
        import { d, e } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ]
    },
    // Declaration sort - default options with `unsafeAutofix`.
    {
      code: `
        import { d, f } from 'foo';
        import { c, e } from 'foo';
        import a from 'foo';
        import { b } from 'foo';
        import A from 'foo';
        import * as g from 'foo';
      `,
      errors: [
        { message: "Expected import declaration of 'c' to be placed before 'd'.", type: 'ImportDeclaration' },
        { message: "Expected import declaration of 'A' to be placed before 'b'.", type: 'ImportDeclaration' },
        {
          message: "Expected import declaration of 'all' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }],
      output: `
        import * as g from 'foo';
        import { c, e } from 'foo';
        import { d, f } from 'foo';
        import A from 'foo';
        import a from 'foo';
        import { b } from 'foo';
      `
    },
    // Declaration sort - `ignoreCase` option.
    {
      code: `
        import { G, h } from 'foo';
        import { e, f } from 'foo';
        import { C } from 'foo';
        import B from 'foo';
        import a from 'foo';
        import d from 'foo';
      `,
      errors: [
        { message: "Expected import declaration of 'e' to be placed before 'G'.", type: 'ImportDeclaration' },
        { message: "Expected import declaration of 'B' to be placed before 'C'.", type: 'ImportDeclaration' },
        { message: "Expected import declaration of 'a' to be placed before 'B'.", type: 'ImportDeclaration' }
      ],
      options: [{ ignoreCase: true }]
    },
    // Declaration sort - `ignoreCase` option with `unsafeAutofix`.
    {
      code: `
        import { G, h } from 'foo';
        import { e, f } from 'foo';
        import { C } from 'foo';
        import B from 'foo';
        import a from 'foo';
        import d from 'foo';
      `,
      errors: [
        { message: "Expected import declaration of 'e' to be placed before 'G'.", type: 'ImportDeclaration' },
        { message: "Expected import declaration of 'B' to be placed before 'C'.", type: 'ImportDeclaration' },
        { message: "Expected import declaration of 'a' to be placed before 'B'.", type: 'ImportDeclaration' }
      ],
      options: [{ ignoreCase: true, unsafeAutofix: true }],
      output: `
        import { e, f } from 'foo';
        import { G, h } from 'foo';
        import a from 'foo';
        import B from 'foo';
        import { C } from 'foo';
        import d from 'foo';
      `
    },
    // Declaration sort - `useOldSingleMemberSyntax` option.
    {
      code: `
        import c from 'foo';
        import { a } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ useOldSingleMemberSyntax: true }]
    },
    // Declaration sort - `useOldSingleMemberSyntax` option with `unsafeAutofix`.
    {
      code: `
        import c from 'foo';
        import { a } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true, useOldSingleMemberSyntax: true }],
      output: `
        import { a } from 'foo';
        import c from 'foo';
      `
    },
    // Declaration sort - `unsafeAutofix` option, ignore if there are comments.
    {
      code: `
        // foo
        import c from 'foo';
        import { a } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'a' to be placed before 'c'.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    {
      code: `
        import c from 'foo';
        // foo
        import { a } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'a' to be placed before 'c'.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    {
      code: `
        import c from 'foo'; // foo
        import { a } from 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'a' to be placed before 'c'.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    {
      code: `
        import c from 'foo';
        import { a } from 'foo'; // foo
      `,
      errors: [
        {
          message: "Expected import declaration of 'a' to be placed before 'c'.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    // Declaration sort - `unsafeAutofix` option, do not ignore if there are no comments.
    {
      code: `
        // foo

        import c from 'foo';
        import { a } from 'foo';
        // foo
      `,
      errors: [
        {
          message: "Expected import declaration of 'a' to be placed before 'c'.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }],
      output: `
        // foo

        import { a } from 'foo';
        import c from 'foo';
        // foo
      `
    },
    // Declaration sort - `allowSeparatedGroups` option.
    {
      code: `
        import a from 'foo';
        import 'foo';

        import b from 'foo';
        import 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ allowSeparatedGroups: true }]
    },
    // Declaration sort - `allowSeparatedGroups` option with `unsafeAutofix`.
    {
      code: `
        import a from 'foo';
        import 'foo';

        import b from 'foo';
        import 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ allowSeparatedGroups: true, unsafeAutofix: true }],
      output: `
        import 'foo';
        import a from 'foo';

        import 'foo';
        import b from 'foo';
      `
    },
    // Declaration sort - `allowSeparatedGroups` option with `unsafeAutofix` but with comments.
    {
      code: `
        // foo

        import a from 'foo';
        import 'foo';

        // foo
        import b from 'foo';
        import 'foo';

        import c from 'foo'; // foo
        import 'foo';

        import d from 'foo';
        import 'foo';  // foo

        import e from 'foo';
        import 'foo';
        // foo

        /*foo*/ import f from 'foo';
        import 'foo';

        import g from 'foo';
        /*foo*/ import 'foo';
      `,
      errors: [
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        },
        {
          message: "Expected import declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ImportDeclaration'
        }
      ],
      options: [{ allowSeparatedGroups: true, unsafeAutofix: true }],
      output: `
        // foo

        import 'foo';
        import a from 'foo';

        // foo
        import 'foo';
        import b from 'foo';

        import c from 'foo'; // foo
        import 'foo';

        import d from 'foo';
        import 'foo';  // foo

        import 'foo';
        import e from 'foo';
        // foo

        /*foo*/ import f from 'foo';
        import 'foo';

        import g from 'foo';
        /*foo*/ import 'foo';
      `
    },
    // Member sort - default options.
    {
      code: `
        import { a, A } from 'foo';
        import { b, B } from 'foo';
        import { y as z, z as y } from 'foo';
      `,
      errors: [
        { message: "Member 'A' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'B' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'y' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' }
      ],
      output: `
        import { A, a } from 'foo';
        import { B, b } from 'foo';
        import { z as y, y as z } from 'foo';
      `
    },
    {
      code: `
        import y, { a, A } from 'foo';
        import z, { b, B } from 'foo';
      `,
      errors: [
        { message: "Member 'A' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'B' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' }
      ],
      output: `
        import y, { A, a } from 'foo';
        import z, { B, b } from 'foo';
      `
    },
    {
      code: `
        import {
          a, // foo
          A
        } from 'foo';
        import {
          b,
          B // foo
        } from 'foo';
        import {
          // foo
          c,
          C
        } from 'foo';
        import {
          d,
          // foo
          D
        } from 'foo';
        import {
          e,
          E
          // foo
        } from 'foo';
      `,
      errors: [
        { message: "Member 'A' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'B' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'C' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'D' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'E' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' }
      ]
    },
    // Member sort order - `ignoreCase` option.
    {
      code: `
        import { B, a } from 'foo';
        import { d, C } from 'foo';
        import { D as e, e as D } from 'foo';
      `,
      errors: [
        { message: "Member 'a' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'C' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' },
        { message: "Member 'D' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' }
      ],
      options: [{ ignoreCase: true }],
      output: `
        import { a, B } from 'foo';
        import { C, d } from 'foo';
        import { e as D, D as e } from 'foo';
      `
    },
    // Member sort order - `useAliases` option.
    {
      code: `
        import { e as D, D as e } from 'foo';
      `,
      errors: [
        { message: "Member 'D' of the import declaration should be sorted alphabetically.", type: 'ImportSpecifier' }
      ],
      options: [{ useAliases: false }],
      output: `
        import { D as e, e as D } from 'foo';
      `
    }
  ],
  valid: [
    // Default options.
    {
      code: `
        import 'foo';
        import * as A from 'foo';
        import * as B from 'foo';
        import { D, e } from 'foo';
        import { C } from 'foo';
        import a, { E, f } from 'foo';
        import b from 'foo';
        import c from 'foo';
        import d from 'foo';
        import { G as g } from 'foo';
      `
    },
    // `memberSyntaxSortOrder` option.
    {
      code: `
        import { C } from 'foo';
        import a, { E, f } from 'foo';
        import b from 'foo';
        import c from 'foo';
        import d from 'foo';
        import { D, e } from 'foo';
        import 'foo';
        import * as A from 'foo';
        import * as B from 'foo';
      `,
      options: [
        {
          memberSyntaxSortOrder: ['single', 'multiple', 'none', 'all']
        }
      ]
    },
    // `ignoreCase` option.
    {
      code: `
        import 'foo';
        import * as A from 'foo';
        import * as a from 'foo';
        import * as b from 'foo';
        import * as B from 'foo';
        import { C, c, f, F } from 'foo';
        import { d, D, E, e } from 'foo';
        import g, { H, h, j, J } from 'foo';
        import K from 'foo';
        import k from 'foo';
        import l from 'foo';
        import L from 'foo';
      `,
      options: [{ ignoreCase: true }]
    },
    // `ignoreDeclarationSort` option.
    {
      code: `
        import { c } from 'foo';
        import b from 'foo';
        import * as a from 'foo';
        import 'foo';
      `,
      options: [{ ignoreDeclarationSort: true }]
    },
    // `ignoreMemberSort` option.
    {
      code: `
        import 'foo';
        import * as A from 'foo';
        import { e, E, C, c } from 'foo';
        import a from 'foo';
      `,
      options: [{ ignoreMemberSort: true }]
    },
    // `allowSeparatedGroups` option.
    {
      code: `
        import 'foo';
        import * as CA from 'foo';
        import * as CB from 'foo';
        import { CD, Ce } from 'foo';
        import { CC } from 'foo';
        import Ca, { CE, Cf } from 'foo';
        import Cb from 'foo';
        import Cc from 'foo';
        import Cd from 'foo';

        import 'foo';
        import * as BA from 'foo';
        import * as BB from 'foo';
        import { BD, Be } from 'foo';
        import { BC } from 'foo';
        import Ba, { BE, Bf } from 'foo';
        import Bb from 'foo';
        import Bc from 'foo';
        import Bd from 'foo';
        // This is a comment.
        import 'foo';
        import * as AA from 'foo';
        import * as AB from 'foo';
        import { AD, Ae } from 'foo';
        import { AC } from 'foo';
        import Aa, { AE, Af } from 'foo';
        import Ab from 'foo';
        import Ac from 'foo';
        import Ad from 'foo';
      `,
      options: [{ allowSeparatedGroups: true }]
    },
    // `useOldSingleMemberSyntax` option.
    {
      code: `
        import 'foo';
        import * as A from 'foo';
        import * as B from 'foo';
        import { C } from 'foo';
        import { D, e } from 'foo';
        import a, { E, f } from 'foo';
        import b from 'foo';
        import c from 'foo';
        import d from 'foo';
      `,
      options: [{ useOldSingleMemberSyntax: true }]
    },
    // `useAliases` option.
    {
      code: `
        import 'foo';
        import * as A from 'foo';
        import { b as B, c } from 'foo';
        import { b, d } from 'foo';
      `,
      options: [{ useAliases: false }]
    }
  ]
});
