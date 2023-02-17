import {strictEqual} from 'assert';
import {exec} from 'child_process';
import {promisify} from 'util';

import test from 'oletus';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import doctest from '../lib/doctest.js';

import resultsBin from './bin/results.js';
import resultsCommonJsDirname from './commonjs/__dirname/results.js';
import resultsCommonJsDoctestRequire from './commonjs/__doctest.require/results.js';
import resultsCommonJsFilename from './commonjs/__filename/results.js';
import resultsCommonJsExports from './commonjs/exports/results.js';
import resultsCommonJsModuleExports from './commonjs/module.exports/results.js';
import resultsCommonJsRequire from './commonjs/require/results.js';
import resultsCommonJsStrict from './commonjs/strict/results.js';
import resultsEs2015 from './es2015/results.js';
import resultsEs2018 from './es2018/results.js';
import resultsEs2020 from './es2020/results.js';
import resultsExceptions from './exceptions/results.js';
import resultsFantasyLand from './fantasy-land/results.js';
import resultsLineEndings from './line-endings/results.js';
import resultsSharedCoffee from './shared/results.coffee.js';
import resultsSharedJs from './shared/results.js';
import resultsStatements from './statements/results.js';
import resultsTranscribe from './transcribe/results.js';


const eq = actual => expected => {
  strictEqual (show (actual), show (expected));
  strictEqual (Z.equals (actual, expected), true);
};

const testModule = (expecteds, path, options) => {
  let promise = null;
  const run = () => (promise ?? (promise = doctest (options) (path)));

  const b = '\u001B[1m';
  const x = '\u001B[22m';
  const prefix = (
    x + 'doctest (' + show (options) + ') (' + b + show (path) + x + ') › ' + b
  );

  test (prefix + '.length', async () => {
    const actuals = await run ();
    eq (actuals.length) (expecteds.length);
  });

  expecteds.forEach (([description, expected], idx) => {
    test (prefix + description, async () => {
      const actuals = await run ();
      eq (actuals[idx]) (expected);
    });
  });
};

const testCommand = (command, expected) => {
  test (command, () =>
    promisify (exec) (command)
    .then (
      actual => {
        eq (0) (expected.status);
        eq (actual.stdout) (expected.stdout);
        eq (actual.stderr) (expected.stderr);
      },
      actual => {
        eq (actual.code) (expected.status);
        eq (actual.stdout) (expected.stdout);
        eq (actual.stderr) (expected.stderr);
      }
    )
  );
};

testModule (resultsSharedJs, 'test/shared/index.js', {
  silent: true,
});

testModule (resultsSharedCoffee, 'test/shared/index.coffee', {
  coffee: true,
  silent: true,
});

testModule (resultsLineEndings, 'test/line-endings/CR.js', {
  silent: true,
});

testModule (resultsLineEndings, 'test/line-endings/CR.coffee', {
  coffee: true,
  silent: true,
});

testModule (resultsLineEndings, 'test/line-endings/CR+LF.js', {
  silent: true,
});

testModule (resultsLineEndings, 'test/line-endings/CR+LF.coffee', {
  coffee: true,
  silent: true,
});

testModule (resultsLineEndings, 'test/line-endings/LF.js', {
  silent: true,
});

testModule (resultsLineEndings, 'test/line-endings/LF.coffee', {
  coffee: true,
  silent: true,
});

testModule (resultsExceptions, 'test/exceptions/index.js', {
  silent: true,
});

testModule (resultsStatements, 'test/statements/index.js', {
  silent: true,
});

testModule (resultsFantasyLand, 'test/fantasy-land/index.js', {
  silent: true,
});

testModule (resultsTranscribe, 'test/transcribe/index.js', {
  prefix: '.',
  openingDelimiter: '```javascript',
  closingDelimiter: '```',
  silent: true,
});

testModule (resultsTranscribe, 'test/transcribe/index.coffee', {
  coffee: true,
  prefix: '.',
  openingDelimiter: '```coffee',
  closingDelimiter: '```',
  silent: true,
});

testModule (resultsCommonJsRequire, 'test/commonjs/require/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsCommonJsExports, 'test/commonjs/exports/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsCommonJsModuleExports, 'test/commonjs/module.exports/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsCommonJsStrict, 'test/commonjs/strict/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsCommonJsDirname, 'test/commonjs/__dirname/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsCommonJsFilename, 'test/commonjs/__filename/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsCommonJsDoctestRequire, 'test/commonjs/__doctest.require/index.js', {
  module: 'commonjs',
  silent: true,
});

testModule (resultsBin, 'test/bin/executable', {
  silent: true,
});

testModule (resultsEs2015, 'test/es2015/index.js', {
  silent: true,
});

testModule (resultsEs2018, 'test/es2018/index.js', {
  silent: true,
});

testModule (resultsEs2020, 'test/es2020/index.js', {
  silent: true,
});

testCommand ('bin/doctest', {
  status: 0,
  stdout: '',
  stderr: '',
});

testCommand ('bin/doctest --xxx', {
  status: 1,
  stdout: '',
  stderr: `error: unknown option \`--xxx'
`,
});

testCommand ('bin/doctest test/shared/index.js', {
  status: 1,
  stdout: `running doctests in test/shared/index.js...
......x.x...........x........x
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
FAIL: expected "on automatic semicolon insertion" on line 155 (got "the rewriter should not rely")
`,
  stderr: '',
});

testCommand ('bin/doctest --coffee test/shared/index.coffee', {
  status: 1,
  stdout: `running doctests in test/shared/index.coffee...
......x.x...........x.....
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
`,
  stderr: '',
});

testCommand ('bin/doctest --silent test/shared/index.js', {
  status: 1,
  stdout: '',
  stderr: '',
});

testCommand ('bin/doctest test/bin/executable', {
  status: 0,
  stdout: `running doctests in test/bin/executable...
.
`,
  stderr: '',
});

testCommand ('bin/doctest --module xxx file.js', {
  status: 1,
  stdout: '',
  stderr: `Error: Invalid module "xxx"
`,
});

testCommand ('bin/doctest --module esm lib/doctest.js', {
  status: 0,
  stdout: `running doctests in lib/doctest.js...
...
`,
  stderr: '',
});

testCommand ('bin/doctest --module esm test/esm/index.js', {
  status: 0,
  stdout: `running doctests in test/esm/index.js...
.
`,
  stderr: '',
});

testCommand ('bin/doctest --module esm test/esm/dependencies.js', {
  status: 0,
  stdout: `running doctests in test/esm/dependencies.js...
.
`,
  stderr: '',
});

testCommand ('bin/doctest --module esm test/esm/incorrect.js', {
  status: 1,
  stdout: `running doctests in test/esm/incorrect.js...
x
FAIL: expected 32 on line 4 (got "0°F")
`,
  stderr: '',
});

testCommand ('bin/doctest --print test/commonjs/exports/index.js', {
  status: 0,
  stdout: `
__doctest.enqueue({
  type: "input",
  thunk: () => {
    return exports.identity(42);
  },
});

__doctest.enqueue({
  type: "output",
  ":": 2,
  "!": false,
  thunk: () => {
    return 42;
  },
});

exports.identity = function(x) {
  return x;
};
`,
  stderr: '',
});

testCommand ('bin/doctest --print --module commonjs test/commonjs/exports/index.js', {
  status: 0,
  stdout: `void (() => {

  const __doctest = {
    require,
    queue: [],
    enqueue: function(io) { this.queue.push(io); },
  };

  void (() => {

    __doctest.enqueue({
      type: "input",
      thunk: () => {
        return exports.identity(42);
      },
    });

    __doctest.enqueue({
      type: "output",
      ":": 2,
      "!": false,
      thunk: () => {
        return 42;
      },
    });

    exports.identity = function(x) {
      return x;
    };
  })();

  (module.exports ?? exports).__doctest = __doctest;
})();
`,
  stderr: '',
});
