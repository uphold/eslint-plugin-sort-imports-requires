# eslint-plugin-sort-imports-requires

An ESLint plugin to sort both import and require declarations in a unified manner.

## Status

[![npm version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]

## Motivation

ESLint's [`sort-imports`](https://eslint.org/docs/rules/sort-imports) only works for `import` statements. However, `require` statements are still being widely used. We needed to validate `import` and `require` statements in a similar way throughout our codebase and we couldn't find an OSS package that would address this need with the features we require.

This plugin is a drop-in replacement to `sort-imports` with a few extra features:

- Provides autofix for potentially unsafe situations (see [`unsafeAutofix`](#unsafeAutofix)).
- Allows sorting by aliases. (see [`useAliases`](#useAliases)).
- Allows restoring the old ESLint behavior where `multiple` type corresponds to all named imports, regardless of how many are imported (see [`useOldSingleMemberSyntax`](#useOldSingleMemberSyntax)).

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
❯ npm i eslint --save-dev
```

Next, install `eslint-plugin-sort-imports-requires`:

```sh
❯ npm install eslint-plugin-sort-imports-requires --save-dev
```

## Usage

Add `sort-imports-requires` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "sort-imports-requires"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "sort-imports-requires/sort-imports": "error",
    "sort-imports-requires/sort-requires": "error"
  }
}
```

## Supported Rules

### `sort-imports` and `sort-requires`

These are the only supported rules and can be configured independently. Both have exactly the same options as ESLint's [`sort-imports`](https://eslint.org/docs/rules/sort-imports) rule, with a few more options:

- `unsafeAutofix` (default: `false`)
- `useAliases` (default: `true`)
- `useOldSingleMemberSyntax` (default: `false`)

#### `unsafeAutofix`

Whether to autofix potentially unsafe scenarios automatically when the `--fix` flag is used when calling `eslint`.

The current scenarios considered unsafe are:

- Sorting import / require declarations because they can have side-effects, therefore the order in which they are executed might matter. That's the reason why the built-in ESLint [`sort-imports`](https://eslint.org/docs/rules/sort-imports) rule does not autofix.
- Sorting dynamic keys with potential side-effects, e.g.: `const { [foo()]: bar } = require('bar')`. In this scenario, the order in which keys are declared might matter.

Enable this option at your own discretion.

#### `useAliases`

Whether to use aliases when sorting.

Consider the following import:

```js
import { foo as bar } from 'some-module';
```

If `useAliases` is enabled, `bar` is used when sorting. If it was disabled, `foo` would have been used instead.

#### `useOldSingleMemberSyntax`

Whether to restore the old ESLint behavior where `multiple` type corresponds to all named imports (regardless of how many are imported), while the `single` type corresponds only to default imports.

# License

[MIT](https://opensource.org/licenses/MIT)

[npm-image]: https://img.shields.io/npm/v/eslint-plugin-sort-imports-requires.svg
[npm-url]: https://www.npmjs.com/package/eslint-plugin-sort-imports-requires
[ci-image]: https://github.com/uphold/eslint-plugin-sort-imports-requires/actions/workflows/ci.yml/badge.svg?branch=master
[ci-url]: https://github.com/uphold/eslint-plugin-sort-imports-requires/actions/workflows/ci.yml
