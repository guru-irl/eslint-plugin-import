import { RuleTester } from '../rule-tester';
import rule from 'rules/no-relative-packages';
import { normalize } from 'path';

import { test, testFilePath } from '../utils';

const ruleTester = new RuleTester();

ruleTester.run('no-relative-packages', rule, {
  valid: [
    ...['some-package', 'some-package/subpath', '@scope/package', '@scope/package/subpath', 'fs', 'node:fs', '/absolute/path', '#alias', '.hidden', '...', '', 'https://example.com/module.js'].map((specifier) => test({
      code: `import ${JSON.stringify(specifier)}`,
      settings: { 'import/resolver': testFilePath('./throwing-resolver.js') },
    })),
    ...['export * from "some-package"', 'export { foo } from "@scope/package"', 'require("some-package")'].map((code) => test({
      code,
      options: [{ commonjs: true }],
      settings: { 'import/resolver': testFilePath('./throwing-resolver.js') },
    })),
    ...['.', './', './index', './index.js'].map((specifier) => test({
      code: `import ${JSON.stringify(specifier)}`,
      filename: testFilePath('./package-named/index.js'),
    })),
    test({
      code: 'import foo from "../package-named"',
      filename: testFilePath('./package/index.js'),
      settings: { 'import/internal-regex': '^\\.' },
    }),
    test({
      code: 'import foo from "./package-named"',
      filename: testFilePath('./bar.js'),
      settings: { 'import/internal-regex': '^\\.' },
    }),
    test({
      code: 'import foo from "./index.js"',
      filename: testFilePath('./package/index.js'),
    }),
    test({
      code: 'import bar from "../bar"',
      filename: testFilePath('./package/index.js'),
    }),
    test({
      code: 'import {foo} from "a"',
      filename: testFilePath('./package-named/index.js'),
    }),
    test({
      code: 'const bar = require("../bar.js")',
      filename: testFilePath('./package/index.js'),
    }),
    test({
      code: 'const bar = require("../not/a/file/path.js")',
      filename: testFilePath('./package/index.js'),
    }),
    test({
      code: 'import "package"',
      filename: testFilePath('./package/index.js'),
    }),
    test({
      code: 'require("../bar.js")',
      filename: testFilePath('./package/index.js'),
    }),
  ],

  invalid: [
    ...['..', '.', '../package-named', './package-named', '..\\parent', '.\\sibling'].map((specifier) => test({
      code: `import ${JSON.stringify(specifier)}`,
      filename: testFilePath('./package/index.js'),
      settings: { 'import/resolver': testFilePath('./throwing-resolver.js') },
      errors: [{ message: /^Resolve error: Unexpected module resolution:/ }],
      output: null,
    })),
    test({
      code: 'import foo from "./package-named"',
      filename: testFilePath('./bar.js'),
      errors: [{
        message: 'Relative import from another package is not allowed. Use `package-named` instead of `./package-named`',
        line: 1,
        column: 17,
      }],
      output: 'import foo from "package-named"',
    }),
    test({
      code: 'import foo from "../package-named"',
      filename: testFilePath('./package/index.js'),
      errors: [{
        message: 'Relative import from another package is not allowed. Use `package-named` instead of `../package-named`',
        line: 1,
        column: 17,
      }],
      output: 'import foo from "package-named"',
    }),
    test({
      code: 'import foo from "../package-scoped"',
      filename: testFilePath('./package/index.js'),
      errors: [{
        message: `Relative import from another package is not allowed. Use \`${normalize('@scope/package-named')}\` instead of \`../package-scoped\``,
        line: 1,
        column: 17,
      }],
      output: `import foo from "@scope/package-named"`,
    }),
    test({
      code: 'import bar from "../bar"',
      filename: testFilePath('./package-named/index.js'),
      errors: [{
        message: `Relative import from another package is not allowed. Use \`${normalize('eslint-plugin-import/tests/files/bar')}\` instead of \`../bar\``,
        line: 1,
        column: 17,
      }],
      output: `import bar from "eslint-plugin-import/tests/files/bar"`,
    }),
  ],
});
