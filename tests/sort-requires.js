const rule = require('../lib').rules['sort-requires'];
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020
  }
});

ruleTester.run('sort', rule, {
  invalid: [
    // Declaration sort - default options.
    {
      code: `
        const a = require('foo');
        const A = require('foo');
        const c = require('foo');
      `,
      errors: [{ message: "Expected require declaration of 'A' to be placed before 'a'.", type: 'VariableDeclaration' }]
    },
    {
      code: `
        const b = require('foo');
        const a = require('foo');
      `,
      errors: [{ message: "Expected require declaration of 'a' to be placed before 'b'.", type: 'VariableDeclaration' }]
    },
    {
      code: `
        const a = require('foo');
        require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        }
      ]
    },
    {
      code: `
        const c = require('foo');
        const { a, b } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ]
    },
    {
      code: `
        const c = require('foo');
        const { d, e } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ]
    },
    {
      code: `
        const { ...x } = require('foo');
        const { y, ...z } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ]
    },
    {
      // Case require('foo').foo and const { x } = require('foo').foo
      code: `
        const { x } = require('foo').foo;
        require('foo').foo.bar;
      `,
      errors: [
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        }
      ]
    },
    {
      // Case require('foo')('foo') and const { x } = require('foo')('foo')
      code: `
        const { x } = require('foo')('foo').bar;
        require('foo')('foo').bar;
      `,
      errors: [
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        }
      ]
    },
    {
      // Case with nested destructuring..
      code: `
        const { foo } = require('foo');
        const { bar: { ZZ } } = require('bar');
        const { baz } = require('baz');
      `,
      errors: [
        {
          message: "Expected require declaration of 'bar' to be placed before 'foo'.",
          type: 'VariableDeclaration'
        }
      ]
    },
    // Declaration sort - default options with `unsafeAutofix`
    {
      code: `
        const { d, f } = require('foo');
        const { c, e } = require('foo');
        const a = require('foo');
        const { b } = require('foo');
        const A = require('foo');
        const { ...Z } = require('foo');
      `,
      errors: [
        { message: "Expected require declaration of 'c' to be placed before 'd'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'A' to be placed before 'b'.", type: 'VariableDeclaration' }
      ],
      options: [{ unsafeAutofix: true }],
      output: `
        const { c, e } = require('foo');
        const { d, f } = require('foo');
        const A = require('foo');
        const { ...Z } = require('foo');
        const a = require('foo');
        const { b } = require('foo');
      `
    },
    {
      // Special case with a regular assignment in the middle.
      code: `
        const c = require('foo');
        const b = 'foo';
        const a = require('foo');
      `,
      errors: [
        { message: "Expected require declaration of 'a' to be placed before 'c'.", type: 'VariableDeclaration' }
      ],
      options: [{ unsafeAutofix: true }],
      output: `
        const a = require('foo');
        const b = 'foo';
        const c = require('foo');
      `
    },
    // Special case in which unassigned requires shouldn't have their order changed after autofixing.
    {
      code: `
        require('a');
        require('b');
        require('c');

        const b = require('foo');
        const a = require('foo');
      `,
      errors: [
        { message: "Expected require declaration of 'a' to be placed before 'b'.", type: 'VariableDeclaration' }
      ],
      options: [{ unsafeAutofix: true }],
      output: `
        require('a');
        require('b');
        require('c');

        const a = require('foo');
        const b = require('foo');
      `
    },
    // Declaration sort - `ignoreCase` option.
    {
      code: `
        const { G, h } = require('foo');
        const { e, f } = require('foo');
        const { C } = require('foo');
        const B = require('foo');
        const a = require('foo');
        const { ...Z } = require('foo');
        const d = require('foo');
      `,
      errors: [
        { message: "Expected require declaration of 'e' to be placed before 'G'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'B' to be placed before 'C'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'a' to be placed before 'B'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'd' to be placed before 'Z'.", type: 'VariableDeclaration' }
      ],
      options: [{ ignoreCase: true }]
    },
    // Declaration sort - `ignoreCase` option with `unsafeAutofix`.
    {
      code: `
        const { G, h } = require('foo');
        const { e, f } = require('foo');
        const { C } = require('foo');
        const B = require('foo');
        const a = require('foo');
        const { ...Z } = require('foo');
        const d = require('foo');
      `,
      errors: [
        { message: "Expected require declaration of 'e' to be placed before 'G'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'B' to be placed before 'C'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'a' to be placed before 'B'.", type: 'VariableDeclaration' },
        { message: "Expected require declaration of 'd' to be placed before 'Z'.", type: 'VariableDeclaration' }
      ],
      options: [{ ignoreCase: true, unsafeAutofix: true }],
      output: `
        const { e, f } = require('foo');
        const { G, h } = require('foo');
        const a = require('foo');
        const B = require('foo');
        const { C } = require('foo');
        const d = require('foo');
        const { ...Z } = require('foo');
      `
    },
    // Declaration sort - `useOldSingleMemberSyntax` option.
    {
      code: `
        const c = require('foo');
        const { a } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ useOldSingleMemberSyntax: true }]
    },
    {
      code: `
        const c = require('foo');
        const { ...Z } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ useOldSingleMemberSyntax: true }]
    },
    // Declaration sort - `useOldSingleMemberSyntax` option with `unsafeAutofix`.
    {
      code: `
        const c = require('foo');
        const { a } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true, useOldSingleMemberSyntax: true }],
      output: `
        const { a } = require('foo');
        const c = require('foo');
      `
    },
    {
      code: `
        const c = require('foo');
        const { ...Z } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'multiple' syntax to be placed before 'single' syntax.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true, useOldSingleMemberSyntax: true }],
      output: `
        const { ...Z } = require('foo');
        const c = require('foo');
      `
    },
    // Declaration sort - `unsafeAutofix` option, ignore if there are comments.
    {
      code: `
        // foo
        const c = require('foo');
        const { a } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'a' to be placed before 'c'.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    {
      code: `
        const c = require('foo');
        // foo
        const { a } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'a' to be placed before 'c'.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    {
      code: `
        const c = require('foo'); // foo
        const { a } = require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'a' to be placed before 'c'.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    {
      code: `
        const c = require('foo');
        const { a } = require('foo'); // foo
      `,
      errors: [
        {
          message: "Expected require declaration of 'a' to be placed before 'c'.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }]
    },
    // Declaration sort - `unsafeAutofix` option, do not ignore if there are no comments.
    {
      code: `
        // foo

        const c = require('foo');
        const { a } = require('foo');
        // foo
      `,
      errors: [
        {
          message: "Expected require declaration of 'a' to be placed before 'c'.",
          type: 'VariableDeclaration'
        }
      ],
      options: [{ unsafeAutofix: true }],
      output: `
        // foo

        const { a } = require('foo');
        const c = require('foo');
        // foo
      `
    },
    // Declaration sort - `allowSeparatedGroups` option with `unsafeAutofix` but with comments.
    {
      code: `
        // foo

        const a = require('foo');
        require('foo');

        // foo
        const b = require('foo');
        require('foo');

        const c = require('foo'); // foo
        require('foo');

        const d = require('foo');
        require('foo');  // foo

        const e = require('foo');
        require('foo');
        // foo

        /*foo*/ const f = require('foo');
        require('foo');

        const g = require('foo');
        /*foo*/ require('foo');
      `,
      errors: [
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        },
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        },
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        },
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        },
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        },
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        },
        {
          message: "Expected require declaration of 'none' syntax to be placed before 'single' syntax.",
          type: 'ExpressionStatement'
        }
      ],
      options: [{ allowSeparatedGroups: true, unsafeAutofix: true }],
      output: `
        // foo

        require('foo');
        const a = require('foo');

        // foo
        require('foo');
        const b = require('foo');

        const c = require('foo'); // foo
        require('foo');

        const d = require('foo');
        require('foo');  // foo

        require('foo');
        const e = require('foo');
        // foo

        /*foo*/ const f = require('foo');
        require('foo');

        const g = require('foo');
        /*foo*/ require('foo');
      `
    },
    // Member sort order - default options.
    {
      code: `
        const { a, A } = require('foo');
        const { b, B } = require('foo');
        const { y: z, z: y } = require('foo');
      `,
      errors: [
        { message: "Member 'A' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'B' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'y' of the require declaration should be sorted alphabetically.", type: 'Property' }
      ],
      output: `
        const { A, a } = require('foo');
        const { B, b } = require('foo');
        const { z: y, y: z } = require('foo');
      `
    },
    {
      // Case with comments.
      code: `
        const {
          a, // foo
          A
        } = require('foo');
        const {
          b,
          B // foo
        } = require('foo');
        const {
          // foo
          c,
          C
        } = require('foo');
        const {
          d,
          // foo
          D
        } = require('foo');
        const {
          e,
          E
          // foo
        } = require('foo');
      `,
      errors: [
        { message: "Member 'A' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'B' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'C' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'D' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'E' of the require declaration should be sorted alphabetically.", type: 'Property' }
      ]
    },
    {
      // Case with side-effects.
      code: `
        const { [getFoo()]: b, a } = require('foo');
      `,
      errors: [{ message: "Member 'a' of the require declaration should be sorted alphabetically.", type: 'Property' }]
    },
    // Member sort order - `ignoreCase` option.
    {
      code: `
        const { B, a } = require('foo');
        const { d, C } = require('foo');
        const { D: e, e: D } = require('foo');
      `,
      errors: [
        { message: "Member 'a' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'C' of the require declaration should be sorted alphabetically.", type: 'Property' },
        { message: "Member 'D' of the require declaration should be sorted alphabetically.", type: 'Property' }
      ],
      options: [{ ignoreCase: true }],
      output: `
        const { a, B } = require('foo');
        const { C, d } = require('foo');
        const { e: D, D: e } = require('foo');
      `
    },
    // Member sort order - `useAliases` option.
    {
      code: `
        const { e: D, D: e } = require('foo');
      `,
      errors: [{ message: "Member 'D' of the require declaration should be sorted alphabetically.", type: 'Property' }],
      options: [{ useAliases: false }],
      output: `
        const { D: e, e: D } = require('foo');
      `
    },
    {
      // Case in which there's no key value (it's a call expression): fallback to local name.
      code: `
        const { b, [getFoo()]: a } = require('foo');
      `,
      errors: [{ message: "Member 'a' of the require declaration should be sorted alphabetically.", type: 'Property' }],
      options: [{ useAliases: false }]
    },
    // Member sort order - `unsafeFix` option.
    {
      code: `
        const { [getFoo()]: b, a } = require('foo');
      `,
      errors: [{ message: "Member 'a' of the require declaration should be sorted alphabetically.", type: 'Property' }],
      options: [{ unsafeAutofix: true }],
      output: `
        const { a, [getFoo()]: b } = require('foo');
      `
    }
  ],
  valid: [
    // Default options.
    {
      code: `
        require('foo');
        const { D, e } = require('foo');
        const { X, ...Y } = require('foo');
        const A = require('foo');
        const B = require('foo');
        const { C } = require('foo');
        const { ...Z } = require('foo');
        const a = require('foo');
        const b = require('foo');
        const c = require('foo');
        const d = require('foo');
        const { G: g } = require('foo');
        const { ...z } = require('foo');
      `
    },
    // `memberSyntaxSortOrder` option.
    {
      code: `
        const A = require('foo');
        const B = require('foo');
        const { C } = require('foo');
        const { Z } = require('foo');
        const a = require('foo');
        const b = require('foo');
        const c = require('foo');
        const { D, e } = require('foo');
        const { X, ...Y } = require('foo');
        require('foo');
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
        require('foo');
        const { C, c, f, F } = require('foo');
        const { d, D, E, e } = require('foo');
        const { X, ...y } = require('foo');
        const A = require('foo');
        const a = require('foo');
        const b = require('foo');
        const B = require('foo');
        const g = require('foo');
        const k = require('foo');
        const K = require('foo');
        const l = require('foo');
        const L = require('foo');
        const { ...Z } = require('foo');
      `,
      options: [{ ignoreCase: true }]
    },
    // `ignoreDeclarationSort` option.
    {
      code: `
        const { c } = require('foo');
        const b = require('foo');
        const a = require('foo');
        require('foo');
      `,
      options: [{ ignoreDeclarationSort: true }]
    },
    // `ignoreMemberSort` option.
    {
      code: `
        require('foo');
        const { e, E, C, c } = require('foo');
        const A = require('foo');
        const a = require('foo');
      `,
      options: [{ ignoreMemberSort: true }]
    },
    // `allowSeparatedGroups` option.
    {
      code: `
      require('foo');
      const { CD, Ce } = require('foo');
      const CA = require('foo');
      const CB = require('foo');
      const { CC } = require('foo');
      const Ca = require('foo');
      const Cb = require('foo');
      const Cc = require('foo');
      const Cd = require('foo');

      require('foo');
      const { BD, Be } = require('foo');
      const BA = require('foo');
      const BB = require('foo');
      const { BC } = require('foo');
      const Ba = require('foo');
      const Bb = require('foo');
      const Bc = require('foo');
      const Bd = require('foo');
      // This is a comment.
      require('foo');
      const { AD, Ae } = require('foo');
      const AA = require('foo');
      const AB = require('foo');
      const { AC } = require('foo');
      const Aa = require('foo');
      const Ab = require('foo');
      const Ac = require('foo');
      const Ad = require('foo');
      `,
      options: [{ allowSeparatedGroups: true }]
    },
    // `useOldSingleMemberSyntax` option.
    {
      code: `
        require('foo');
        const { C } = require('foo');
        const { D, e } = require('foo');
        const A = require('foo');
        const B = require('foo');
        const a = require('foo');
        const b = require('foo');
        const c = require('foo');
        const d = require('foo');
      `,
      options: [{ useOldSingleMemberSyntax: true }]
    },
    // `useAliases` option.
    {
      code: `
        require('foo');
        const { b: B, c } = require('foo');
        const { b, d } = require('foo');
        const A = require('foo');
      `,
      options: [{ useAliases: false }]
    }
  ]
});
