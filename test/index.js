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
import resultsContiguity from './contiguity/results.js';
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
  // deepStrictEqual (actual, expected);
  strictEqual (show (actual), show (expected));
  strictEqual (Z.equals (actual, expected), true);
};

const jsi = results => path => options => {
  results.forEach (({description, doctest: expected}, idx) => {
    test (`${relative ('test', path)} \u001B[2m›\u001B[0m ${description}`, () =>
      doctest ({silent: true, logFunction: [], ...options}) (path)
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

jsi (resultsSharedCoffee)
    ('test/shared/index.coffee')
    ({type: 'coffee'});

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

jsi (resultsContiguity)
    ('test/contiguity/index.js')
    ({});

jsi (resultsContiguity)
    ('test/contiguity/index.coffee')
    ({});

cli ('bin/doctest')
    (stdout (''));

cli ('bin/doctest --xxx')
    (stderr (`error: unknown option \`--xxx'
`));

cli ('bin/doctest file.js --type')
    (stderr (`error: option \`-t, --type <type>' argument missing
`));

cli ('bin/doctest file.js --type xxx')
    (stderr (`Error: Invalid type "xxx"
`));

cli ('bin/doctest test/shared/index.js')
    ({code: 1,
      stdout: `running doctests in test/shared/index.js...
......x.x...........x.......xx

Unexpected result on line 31:

> two + two
\u001B[0;32m5\u001B[0m
\u001B[0;31m4\u001B[0m

Unexpected result on line 38:

> [].length
\u001B[0;32m! TypeError\u001B[0m
\u001B[0;31m0\u001B[0m

Unexpected result on line 97:

>10 -
..5
\u001B[0;32m9.5\u001B[0m
\u001B[0;31m5\u001B[0m

Unexpected result on lines 149-152:

> ["foo", "bar", "baz"]
. .join(",")
. .toUpperCase()
. .split(",")
\u001B[0;32m[ "FOO",
. "BAR",
. "BAZ",
. "XXX" ]\u001B[0m
\u001B[0;31m["FOO", "BAR", "BAZ"]\u001B[0m

Unexpected result on line 156:

> "the rewriter should not rely"
\u001B[0;32m"on automatic semicolon insertion"\u001B[0m
\u001B[0;31m"the rewriter should not rely"\u001B[0m

`,
      stderr: ''});

cli ('bin/doctest test/shared/index.coffee')
    ({code: 1,
      stdout: `running doctests in test/shared/index.coffee...
......x.x...........x.......xx

Unexpected result on line 31:

> two + two
\u001B[0;32m5\u001B[0m
\u001B[0;31m4\u001B[0m

Unexpected result on line 38:

> [].length
\u001B[0;32m! TypeError\u001B[0m
\u001B[0;31m0\u001B[0m

Unexpected result on line 97:

>10 -
..5
\u001B[0;32m9.5\u001B[0m
\u001B[0;31m5\u001B[0m

Unexpected result on lines 149-152:

> ["foo", "bar", "baz"]
. .join(",")
. .toUpperCase()
. .split(",")
\u001B[0;32m[ "FOO"
. "BAR"
. "BAZ"
. "XXX" ]\u001B[0m
\u001B[0;31m["FOO", "BAR", "BAZ"]\u001B[0m

Unexpected result on line 156:

> "the rewriter should not rely"
\u001B[0;32m"on automatic semicolon insertion"\u001B[0m
\u001B[0;31m"the rewriter should not rely"\u001B[0m

`,
      stderr: ''});

cli ('bin/doctest test/shared/index.js test/shared/index.coffee')
    ({code: 1,
      stdout: `running doctests in test/shared/index.js...
......x.x...........x.......xx

Unexpected result on line 31:

> two + two
\u001B[0;32m5\u001B[0m
\u001B[0;31m4\u001B[0m

Unexpected result on line 38:

> [].length
\u001B[0;32m! TypeError\u001B[0m
\u001B[0;31m0\u001B[0m

Unexpected result on line 97:

>10 -
..5
\u001B[0;32m9.5\u001B[0m
\u001B[0;31m5\u001B[0m

Unexpected result on lines 149-152:

> ["foo", "bar", "baz"]
. .join(",")
. .toUpperCase()
. .split(",")
\u001B[0;32m[ "FOO",
. "BAR",
. "BAZ",
. "XXX" ]\u001B[0m
\u001B[0;31m["FOO", "BAR", "BAZ"]\u001B[0m

Unexpected result on line 156:

> "the rewriter should not rely"
\u001B[0;32m"on automatic semicolon insertion"\u001B[0m
\u001B[0;31m"the rewriter should not rely"\u001B[0m

running doctests in test/shared/index.coffee...
......x.x...........x.......xx

Unexpected result on line 31:

> two + two
\u001B[0;32m5\u001B[0m
\u001B[0;31m4\u001B[0m

Unexpected result on line 38:

> [].length
\u001B[0;32m! TypeError\u001B[0m
\u001B[0;31m0\u001B[0m

Unexpected result on line 97:

>10 -
..5
\u001B[0;32m9.5\u001B[0m
\u001B[0;31m5\u001B[0m

Unexpected result on lines 149-152:

> ["foo", "bar", "baz"]
. .join(",")
. .toUpperCase()
. .split(",")
\u001B[0;32m[ "FOO"
. "BAR"
. "BAZ"
. "XXX" ]\u001B[0m
\u001B[0;31m["FOO", "BAR", "BAZ"]\u001B[0m

Unexpected result on line 156:

> "the rewriter should not rely"
\u001B[0;32m"on automatic semicolon insertion"\u001B[0m
\u001B[0;31m"the rewriter should not rely"\u001B[0m

`,
      stderr: ''});

cli ('bin/doctest test/exceptions/index.js')
    ({code: 1,
      stdout: `running doctests in test/exceptions/index.js...
.xxxxx.x.xx

Unexpected result on line 6:

> new Error()
\u001B[0;32mnew Error('Invalid value')\u001B[0m
\u001B[0;31mnew Error ("")\u001B[0m

Unexpected result on line 9:

> new Error('Invalid value')
\u001B[0;32mnew Error()\u001B[0m
\u001B[0;31mnew Error ("Invalid value")\u001B[0m

Unexpected result on line 12:

> new Error('Invalid value')
\u001B[0;32mnew Error('XXX')\u001B[0m
\u001B[0;31mnew Error ("Invalid value")\u001B[0m

Unexpected result on line 15:

> new Error('Invalid value')
\u001B[0;32m! Error: Invalid value\u001B[0m
\u001B[0;31mnew Error ("Invalid value")\u001B[0m

Unexpected result on line 18:

> sqrt(-1)
\u001B[0;32mnew Error('Invalid value')\u001B[0m
\u001B[0;31m! Error: Invalid value\u001B[0m

Unexpected result on line 24:

> null.length
\u001B[0;32m! Error\u001B[0m
\u001B[0;31m! TypeError: Cannot read property 'length' of null\u001B[0m

Unexpected result on line 30:

> sqrt(-1)
\u001B[0;32m! Error: XXX\u001B[0m
\u001B[0;31m! Error: Invalid value\u001B[0m

Unexpected result on line 33:

> 'foo' + 'bar'
\u001B[0;32mfoobar\u001B[0m
\u001B[0;31m"foobar"\u001B[0m

`,
      stderr: ''});

cli ('bin/doctest --silent test/shared/index.js')
    (stderr (''));

cli ('bin/doctest test/bin/executable')
    (stderr (`Error: Cannot infer type from extension
`));

cli ('bin/doctest --type js test/bin/executable')
    (stdout (`running doctests in test/bin/executable...
.

`));

cli ('bin/doctest --log-function stdout --log-function stderr test/shared/async.js')
    (stdout (`running doctests in test/shared/async.js...
....

`));

cli ('bin/doctest --module commonjs --log-function stdout --log-function stderr test/shared/async.js')
    (stdout (`running doctests in test/shared/async.js...
....

`));

cli ('bin/doctest --log-function stdout --log-function stderr test/shared/async.coffee')
    (stdout (`running doctests in test/shared/async.coffee...
....

`));

cli ('bin/doctest --log-function stdout --log-function stderr test/shared/logging.js')
    ({status: 1,
      stdout: `running doctests in test/shared/logging.js...
.........x.xxxx........

Unexpected result on line 34:

> (stdout (1), 3)
\u001B[0;32m2\u001B[0m
\u001B[0;31m3\u001B[0m

Unexpected result on line 41:

> (stdout (1), stdout (2), 3)
\u001B[0;32m3\u001B[0m
\u001B[0;31m2\u001B[0m

Unexpected result on an unknown line:

> (stdout (1), stdout (2), 3)
\u001B[0;32m<expected nothing>\u001B[0m
\u001B[0;31m3\u001B[0m

Unexpected result on line 46:

> (stdout (1), stdout (2), 3)
\u001B[0;32m2\u001B[0m
\u001B[0;31m1\u001B[0m

Unexpected result on line 47:

> (stdout (1), stdout (2), 3)
\u001B[0;32m1\u001B[0m
\u001B[0;31m2\u001B[0m

`,
      stderr: ''});

// cli ('bin/doctest --module esm test/esm/async.mjs')
//     ({status: 1,
//       stdout: `running doctests in test/esm/async.mjs...
// x
// FAIL: expected undefined on line 6 (got ! ReferenceError: stdout is not defined)

// `,
//       stderr: ''});

// cli ('bin/doctest --module esm --log-function stdout --log-function stderr test/esm/async.mjs')
//     ({status: 0,
//       stdout: `running doctests in test/esm/async.mjs...
// ....

// `,
//       stderr: ''});

cli ('bin/doctest --module xxx file.js')
    (stderr (`Error: Invalid module "xxx"
`));

cli ('bin/doctest --module esm lib/doctest.js')
    (stdout (`running doctests in lib/doctest.js...


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

Unexpected result on line 4:

> toFahrenheit (0)
\u001B[0;32m32\u001B[0m
\u001B[0;31m"0°F"\u001B[0m

`,
      stderr: ''});

cli ('bin/doctest --module esm --print test/esm/index.js')
    (stdout (`export const __doctest = {
  queue: [],
  enqueue: function(io) { this.queue.push(io); },
};




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
  outputs: [
    {
      lines: [
        {number: 4, text: '32'},
      ],
      channel: null,
      thunk: () => {
        return (
          32
        );
      },
    },
  ],
});


export function toFahrenheit(degreesCelsius) {
  return degreesCelsius * 9 / 5 + 32;
}
`));

cli ('bin/doctest --module esm --silent test/esm/index.js')
    (stdout (''));

cli ('bin/doctest --module esm --type xxx test/esm/index.js')
    (stderr (`Error: Cannot use file type when module is "esm"
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
  outputs: [
    {
      lines: [
        {number: 2, text: '42'},
      ],
      channel: null,
      thunk: () => {
        return (
          42
        );
      },
    },
  ],
});


exports.identity = function(x) {
  return x;
};
`));

cli ('bin/doctest --print --module amd test/amd/index.js')
    (stdout (`define(function() {
  
  
  
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
  outputs: [
    {
      lines: [
        {number: 5, text: '32'},
      ],
      channel: null,
      thunk: () => {
        return (
          32
        );
      },
    },
  ],
});

  
  function toFahrenheit(degreesCelsius) {
    return degreesCelsius * 9 / 5 + 32;
  }
  return toFahrenheit;
});
`));

cli ('bin/doctest --print --module commonjs test/commonjs/exports/index.js')
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
  outputs: [
    {
      lines: [
        {number: 2, text: '42'},
      ],
      channel: null,
      thunk: () => {
        return (
          42
        );
      },
    },
  ],
});


exports.identity = function(x) {
  return x;
};
`));

cli ('bin/doctest --print --module commonjs --log-function stdout --log-function stderr test/commonjs/exports/index.js')
    (stdout (`
__doctest.enqueue({
  input: {
    lines: [
      {number: 1, text: '> exports.identity(42)'},
    ],
    thunk: (stdout, stderr) => {
      return (
        exports.identity(42)
      );
    },
  },
  outputs: [
    {
      lines: [
        {number: 2, text: '42'},
      ],
      channel: null,
      thunk: () => {
        return (
          42
        );
      },
    },
  ],
});


exports.identity = function(x) {
  return x;
};
`));
