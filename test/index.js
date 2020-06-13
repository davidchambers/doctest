import {strictEqual} from 'assert';
import {exec} from 'child_process';
import {relative} from 'path';
import {promisify} from 'util';

import test from 'oletus';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import doctest from '../lib/doctest.js';

import resultsAmd from './amd/results.js';
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
import resultsEsmTranscribe from './esm/transcribe/results.js';
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

const jsi = results => path => options => {
  results.forEach (({description, doctest: expected}, idx) => {
    test (`${relative ('test', path)} \u001B[2m›\u001B[0m ${description}`, () =>
      doctest ({silent: true, ...options}) (path)
      .then (actuals => { eq (actuals[idx]) (expected); })
    );
  });
};

const cli = command => expected => {
  test (command, () =>
    promisify (exec) (`${command} --nodejs --no-warnings`)
    .then (({stdout, stderr}) =>    { eq ({code: 0, stdout, stderr}) (expected); },
           ({stdout, stderr, code}) => { eq ({code, stdout, stderr}) (expected); })
  );
};

const stdout = stdout => ({code: 0, stdout, stderr: ''});
const stderr = stderr => ({code: 1, stdout: '', stderr});

jsi (resultsSharedJs)
    ('test/shared/index.js')
    ({});

jsi (resultsSharedCoffee)
    ('test/shared/index.coffee')
    ({});

jsi (resultsLineEndings)
    ('test/line-endings/CR.js')
    ({});

jsi (resultsLineEndings)
    ('test/line-endings/CR.coffee')
    ({});

jsi (resultsLineEndings)
    ('test/line-endings/CR+LF.js')
    ({});

jsi (resultsLineEndings)
    ('test/line-endings/CR+LF.coffee')
    ({});

jsi (resultsLineEndings)
    ('test/line-endings/LF.js')
    ({});

jsi (resultsLineEndings)
    ('test/line-endings/LF.coffee')
    ({});

jsi (resultsExceptions)
    ('test/exceptions/index.js')
    ({});

jsi (resultsStatements)
    ('test/statements/index.js')
    ({});

jsi (resultsFantasyLand)
    ('test/fantasy-land/index.js')
    ({module: 'esm'});

jsi (resultsTranscribe)
    ('test/transcribe/index.js')
    ({prefix: '.',
      openingDelimiter: '```javascript',
      closingDelimiter: '```'});

jsi (resultsTranscribe)
    ('test/transcribe/index.coffee')
    ({prefix: '.',
      openingDelimiter: '```coffee',
      closingDelimiter: '```'});

jsi (resultsAmd)
    ('test/amd/index.js')
    ({module: 'amd'});

jsi (resultsCommonJsRequire)
    ('test/commonjs/require/index.js')
    ({module: 'commonjs'});

jsi (resultsCommonJsExports)
    ('test/commonjs/exports/index.js')
    ({module: 'commonjs'});

jsi (resultsCommonJsModuleExports)
    ('test/commonjs/module.exports/index.js')
    ({module: 'commonjs'});

jsi (resultsCommonJsStrict)
    ('test/commonjs/strict/index.js')
    ({module: 'commonjs'});

jsi (resultsCommonJsDirname)
    ('test/commonjs/__dirname/index.js')
    ({module: 'commonjs'});

jsi (resultsCommonJsFilename)
    ('test/commonjs/__filename/index.js')
    ({module: 'commonjs'});

jsi (resultsCommonJsDoctestRequire)
    ('test/commonjs/__doctest.require/index.js')
    ({module: 'commonjs'});

jsi (resultsBin)
    ('test/bin/executable')
    ({type: 'js'});

jsi (resultsEs2015)
    ('test/es2015/index.js')
    ({});

jsi (resultsEs2018)
    ('test/es2018/index.js')
    ({});

jsi (resultsEsmTranscribe)
    ('test/esm/transcribe/index.js')
    ({module: 'esm',
      prefix: '.'});

cli ('bin/doctest')
    (stderr (`error: No files for doctesting provided
`));

cli ('bin/doctest --xxx')
    (stderr (`error: unknown option \`--xxx'
`));

cli ('bin/doctest file.js --type')
    (stderr (`error: option \`-t, --type <type>' argument missing
`));

cli ('bin/doctest file.js --type xxx')
    (stderr (`error: Invalid type \`xxx'
`));

cli ('bin/doctest test/shared/index.js')
    ({code: 1,
      stdout: `running doctests in test/shared/index.js...
......x.x...........x........x
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
FAIL: expected "on automatic semicolon insertion" on line 155 (got "the rewriter should not rely")
`,
      stderr: ''});

cli ('bin/doctest test/shared/index.coffee')
    ({code: 1,
      stdout: `running doctests in test/shared/index.coffee...
......x.x...........x........x
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
FAIL: expected "on automatic semicolon insertion" on line 155 (got "the rewriter should not rely")
`,
      stderr: ''});

cli ('bin/doctest test/shared/index.js test/shared/index.coffee')
    ({code: 1,
      stdout: `running doctests in test/shared/index.js...
......x.x...........x........x
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
FAIL: expected "on automatic semicolon insertion" on line 155 (got "the rewriter should not rely")
running doctests in test/shared/index.coffee...
......x.x...........x........x
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
FAIL: expected "on automatic semicolon insertion" on line 155 (got "the rewriter should not rely")
`,
      stderr: ''});

cli ('bin/doctest --silent test/shared/index.js')
    (stderr (''));

cli ('bin/doctest test/bin/executable')
    (stderr (`error: Cannot infer type from extension
`));

cli ('bin/doctest --type js test/bin/executable')
    (stdout (`running doctests in test/bin/executable...
.
`));

cli ('bin/doctest --module xxx file.js')
    (stderr (`error: Invalid module \`xxx'
`));

cli ('bin/doctest --module esm lib/doctest.js')
    (stdout (`running doctests in lib/doctest.js...
...
`));

cli ('bin/doctest --module esm test/esm/index.js')
    (stdout (`running doctests in test/esm/index.js...
.
`));

cli ('bin/doctest --module esm test/esm/dependencies.js')
    (stdout (`running doctests in test/esm/dependencies.js...
.
`));

cli ('bin/doctest --module esm test/esm/incorrect.js')
    ({code: 1,
      stdout: `running doctests in test/esm/incorrect.js...
x
FAIL: expected 32 on line 4 (got "0°F")
`,
      stderr: ''});

cli ('bin/doctest --module esm --print test/esm/index.js')
    (stdout (`
export const __doctest = {
  queue: [],
  enqueue: function(io) { this.queue.push(io); },
};

// Convert degrees Celsius to degrees Fahrenheit.
//

__doctest.enqueue({
  input: {
    lines: [
      {number: 3, text: '> toFahrenheit (0)'},
    ],
    thunk: () => {
      return (
        toFahrenheit (0)
      );
    },
  },
  output: {
    lines: [
      {number: 4, text: '32'},
    ],
    thunk: () => {
      return (
        32
      );
    },
  },
});

export function toFahrenheit(degreesCelsius) {
  return degreesCelsius * 9 / 5 + 32;
}

`));

cli ('bin/doctest --module esm --silent test/esm/index.js')
    (stdout (''));

cli ('bin/doctest --module esm --type xxx test/esm/index.js')
    (stderr (`error: Cannot use file type when module is "esm"
`));

cli ('bin/doctest --print test/commonjs/exports/index.js')
    (stdout (`
__doctest.enqueue({
  input: {
    lines: [
      {number: 1, text: '> exports.identity(42)'},
    ],
    thunk: () => {
      return (
        exports.identity(42)
      );
    },
  },
  output: {
    lines: [
      {number: 2, text: '42'},
    ],
    thunk: () => {
      return (
        42
      );
    },
  },
});

exports.identity = function(x) {
  return x;
};
`));

cli ('bin/doctest --print --module amd test/amd/index.js')
    (stdout (`
define(function() {
  // Convert degrees Celsius to degrees Fahrenheit.
  //

__doctest.enqueue({
  input: {
    lines: [
      {number: 4, text: '> toFahrenheit(0)'},
    ],
    thunk: () => {
      return (
        toFahrenheit(0)
      );
    },
  },
  output: {
    lines: [
      {number: 5, text: '32'},
    ],
    thunk: () => {
      return (
        32
      );
    },
  },
});

  function toFahrenheit(degreesCelsius) {
    return degreesCelsius * 9 / 5 + 32;
  }
  return toFahrenheit;
});

function define(...args) {
  args[args.length - 1]();
}
`));

cli ('bin/doctest --print --module commonjs test/commonjs/exports/index.js')
    (stdout (`void (() => {

  const __doctest = {
    require,
    queue: [],
    enqueue: function(io) { this.queue.push(io); },
  };

  void (() => {

    __doctest.enqueue({
      input: {
        lines: [
          {number: 1, text: '> exports.identity(42)'},
        ],
        thunk: () => {
          return (
            exports.identity(42)
          );
        },
      },
      output: {
        lines: [
          {number: 2, text: '42'},
        ],
        thunk: () => {
          return (
            42
          );
        },
      },
    });

    exports.identity = function(x) {
      return x;
    };
  })();

  (module.exports || exports).__doctest = __doctest;
})();
`));
