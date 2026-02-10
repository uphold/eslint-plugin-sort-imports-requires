// This file tests that type declarations compile correctly.
import type { RuleOptions } from '../lib/index.js';
import plugin from '../lib/index.js';

// Test default import (ESM style).
const pluginESM = plugin;

pluginESM.rules['sort-imports'];
pluginESM.rules['sort-requires'];

// Test rule options typing.
const validOptions: RuleOptions = {
  ignoreCase: true,
  memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
  unsafeAutofix: false
};

// These should fail to compile (tests invalid configurations).
const invalidOptions1: RuleOptions = {
  // @ts-expect-error - invalid `memberSyntaxSortOrder` length.
  memberSyntaxSortOrder: ['none', 'all']
};

const invalidOptions2: RuleOptions = {
  // @ts-expect-error - invalid type for `ignoreCase`.
  ignoreCase: 'true'
};
