import {strictEqual} from 'node:assert';
import {exec} from 'node:child_process';
import {promisify} from 'node:util';

import test from 'oletus';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import {Incorrect, Correct} from '../lib/Comparison.js';
import {Failure, Success} from '../lib/Effect.js';
import {Line} from '../lib/Line.js';
import {Result, Channel} from '../lib/Output.js';
import doctest from '../lib/doctest.js';

import resultsBin from './bin/results.js';
import resultsCommonJsDirnameCoffee from './commonjs/__dirname/results.coffee.js';
import resultsCommonJsDirnameJs from './commonjs/__dirname/results.js';
import resultsCommonJsDoctestRequire from './commonjs/__doctest.require/results.js';
import resultsCommonJsFilenameCoffee from './commonjs/__filename/results.coffee.js';
import resultsCommonJsFilenameJs from './commonjs/__filename/results.js';
import resultsCommonJsExports from './commonjs/exports/results.js';
import resultsCommonJsModuleExports from './commonjs/module.exports/results.js';
import resultsCommonJsRequire from './commonjs/require/results.js';
import resultsCommonJsStrict from './commonjs/strict/results.js';
import resultsContiguity from './contiguity/results.js';
import resultsEs2015 from './es2015/results.js';
import resultsEs2018 from './es2018/results.js';
import resultsEs2020 from './es2020/results.js';
import resultsEsmGlobals from './esm/globals/results.js';
import resultsExceptions from './exceptions/results.js';
import resultsFantasyLand from './fantasy-land/results.js';
import resultsLineEndings from './line-endings/results.js';
import resultsLogging from './logging/results.js';
import resultsSharedCoffee from './shared/results.coffee.js';
import resultsSharedJs from './shared/results.js';
import resultsStatements from './statements/results.js';
import resultsTranscribe from './transcribe/results.js';


const style = ([chunk, ...chunks], ...args) => chunks.reduce (
  (text, chunk, idx) => `${text}\u001B[${args[idx]}m${chunk}`,
  chunk
);

const eq = actual => expected => {
  strictEqual (show (actual), show (expected));
  strictEqual (Z.equals (actual, expected), true);
};

const b = '\u001B[1m';
const x = '\u001B[22m';

const formatDescription = options => path => description => (
  x + 'doctest (' + show (options) + ') (' + b + show (path) + x + ') › ' +
  b + description
);

const Test = description => input => output => comparison => ({
  description,
  expected: {
    lines: {
      input,
      output,
    },
    comparison,
  },
});

const dependencies = {
  Test,
  Line,
  Incorrect,
  Correct,
  Failure,
  Success,
  Result,
  Channel,
};

const testModule = (module, path, options) => {
  const expecteds = module (dependencies);

  let promise = null;
  const run = () => (promise ?? (promise = doctest (options) (path)));

  test (formatDescription (options) (path) ('.length'), async () => {
    const actuals = await run ();
    eq (actuals.length) (expecteds.length);
  });

  expecteds.forEach (({description, expected}, idx) => {
    test (formatDescription (options) (path) (description), async () => {
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
});

testModule (resultsSharedCoffee, 'test/shared/index.coffee', {
  coffee: true,
});

testModule (resultsLineEndings, 'test/line-endings/CR.js', {
});

testModule (resultsLineEndings, 'test/line-endings/CR.coffee', {
  coffee: true,
});

testModule (resultsLineEndings, 'test/line-endings/CR+LF.js', {
});

testModule (resultsLineEndings, 'test/line-endings/CR+LF.coffee', {
  coffee: true,
});

testModule (resultsLineEndings, 'test/line-endings/LF.js', {
});

testModule (resultsLineEndings, 'test/line-endings/LF.coffee', {
  coffee: true,
});

testModule (resultsExceptions, 'test/exceptions/index.js', {
});

testModule (resultsStatements, 'test/statements/index.js', {
});

testModule (resultsFantasyLand, 'test/fantasy-land/index.js', {
  module: 'esm',
});

testModule (resultsTranscribe, 'test/transcribe/index.js', {
  prefix: '.',
  openingDelimiter: '```javascript',
  closingDelimiter: '```',
});

testModule (resultsTranscribe, 'test/transcribe/index.coffee', {
  coffee: true,
  prefix: '.',
  openingDelimiter: '```coffee',
  closingDelimiter: '```',
});

testModule (resultsCommonJsRequire, 'test/commonjs/require/index.js', {
  module: 'commonjs',
});

testModule (resultsCommonJsExports, 'test/commonjs/exports/index.js', {
  module: 'commonjs',
});

testModule (resultsCommonJsModuleExports, 'test/commonjs/module.exports/index.js', {
  module: 'commonjs',
});

testModule (resultsCommonJsStrict, 'test/commonjs/strict/index.js', {
  module: 'commonjs',
});

testModule (resultsCommonJsDirnameJs, 'test/commonjs/__dirname/index.js', {
  module: 'commonjs',
});

testModule (resultsCommonJsDirnameCoffee, 'test/commonjs/__dirname/index.coffee', {
  module: 'commonjs',
  coffee: true,
});

testModule (resultsCommonJsFilenameJs, 'test/commonjs/__filename/index.js', {
  module: 'commonjs',
});

testModule (resultsCommonJsFilenameCoffee, 'test/commonjs/__filename/index.coffee', {
  module: 'commonjs',
  coffee: true,
});

testModule (resultsCommonJsDoctestRequire, 'test/commonjs/__doctest.require/index.js', {
  module: 'commonjs',
});

testModule (resultsBin, 'test/bin/executable', {
});

testModule (resultsEs2015, 'test/es2015/index.js', {
});

testModule (resultsEs2018, 'test/es2018/index.js', {
});

testModule (resultsEs2020, 'test/es2020/index.js', {
});

testModule (resultsEsmGlobals, 'test/esm/globals/index.js', {
  module: 'esm',
  silent: true,
});

testModule (resultsContiguity, 'test/contiguity/index.js', {
});

testModule (resultsContiguity, 'test/contiguity/index.coffee', {
  coffee: true,
});

testModule (resultsLogging, 'test/logging/index.js', {
  logFunctions: ['stdout', 'stderr'],
});

{
  const options = {module: 'esm', print: true};
  const path = 'test/esm/index.js';
  test (formatDescription (options) (path) ('printing'), async () => {
    const actual = await doctest (options) (path);
    const expected = `


__doctest.enqueue({
  input: {
    lines: [
      {number: 3, text: "> toFahrenheit (0)"},
    ],
    thunk: ([]) => {
      return (
        toFahrenheit (0)
      );
    },
  },
  outputs: [
    {
      lines: [
        {number: 4, text: "32"},
      ],
      channel: null,
      thunk: ([]) => {
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
`;
    eq (actual) (expected);
  });
}

testCommand ('bin/doctest', {
  status: 0,
  stdout: style``,
  stderr: style``,
});

testCommand ('bin/doctest --xxx', {
  status: 1,
  stdout: style``,
  stderr: style`error: unknown option \`--xxx'
`,
});

testCommand ('bin/doctest test/shared/index.js', {
  status: 1,
  stdout: style`
Running doctests in ${1}test/shared/index.js${22}...

${7}   30 ${0} ${34}> two + two${0}
${7}   31 ${0} ${35}5${0}

${34}4${0}
${35}5${0}

${7}   37 ${0} ${34}> [].length${0}
${7}   38 ${0} ${35}throw new TypeError${0}

${34}0${0}
${35}${1}throw${22} new TypeError ("")${0}

${7}   95 ${0} ${34}>10 -${0}
${7}   96 ${0} ${34}..5${0}
${7}   97 ${0} ${35}9.5${0}

${34}5${0}
${35}9.5${0}

${7}  154 ${0} ${34}> "the rewriter should not rely"${0}
${7}  155 ${0} ${35}"on automatic semicolon insertion"${0}

${34}"the rewriter should not rely"${0}
${35}"on automatic semicolon insertion"${0}

`,
  stderr: style``,
});

testCommand ('bin/doctest --coffee test/shared/index.coffee', {
  status: 1,
  stdout: style`
Running doctests in ${1}test/shared/index.coffee${22}...

${7}   30 ${0} ${34}> two + two${0}
${7}   31 ${0} ${35}5${0}

${34}4${0}
${35}5${0}

${7}   37 ${0} ${34}> [].length${0}
${7}   38 ${0} ${35}throw new TypeError${0}

${34}0${0}
${35}${1}throw${22} new TypeError ("")${0}

${7}   95 ${0} ${34}>10 -${0}
${7}   96 ${0} ${34}..5${0}
${7}   97 ${0} ${35}9.5${0}

${34}5${0}
${35}9.5${0}

`,
  stderr: style``,
});

testCommand ('bin/doctest test/exceptions/index.js', {
  status: 1,
  stdout: style`
Running doctests in ${1}test/exceptions/index.js${22}...

${7}    5 ${0} ${34}> new Error()${0}
${7}    6 ${0} ${35}new Error('Invalid value')${0}

${34}new Error ("")${0}
${35}new Error ("Invalid value")${0}

${7}    8 ${0} ${34}> new Error('Invalid value')${0}
${7}    9 ${0} ${35}new Error()${0}

${34}new Error ("Invalid value")${0}
${35}new Error ("")${0}

${7}   11 ${0} ${34}> new Error('Invalid value')${0}
${7}   12 ${0} ${35}new Error('XXX')${0}

${34}new Error ("Invalid value")${0}
${35}new Error ("XXX")${0}

${7}   14 ${0} ${34}> new Error('Invalid value')${0}
${7}   15 ${0} ${35}throw new Error('Invalid value')${0}

${34}new Error ("Invalid value")${0}
${35}${1}throw${22} new Error ("Invalid value")${0}

${7}   17 ${0} ${34}> sqrt(-1)${0}
${7}   18 ${0} ${35}new Error('Invalid value')${0}

${34}${1}throw${22} new Error ("Invalid value")${0}
${35}new Error ("Invalid value")${0}

${7}   23 ${0} ${34}> 0..toString(1)${0}
${7}   24 ${0} ${35}throw new Error${0}

${34}${1}throw${22} new RangeError ("toString() radix argument must be between 2 and 36")${0}
${35}${1}throw${22} new Error ("")${0}

${7}   29 ${0} ${34}> sqrt(-1)${0}
${7}   30 ${0} ${35}throw new Error('XXX')${0}

${34}${1}throw${22} new Error ("Invalid value")${0}
${35}${1}throw${22} new Error ("XXX")${0}

${7}   32 ${0} ${34}> 'foo' + 'bar'${0}
${7}   33 ${0} ${35}foobar${0}

${34}"foobar"${0}
${35}${1}throw${22} new ReferenceError ("foobar is not defined")${0}

`,
  stderr: style``,
});

testCommand ('bin/doctest --silent test/shared/index.js', {
  status: 1,
  stdout: style``,
  stderr: style``,
});

testCommand ('bin/doctest --module xxx file.js', {
  status: 1,
  stdout: style``,
  stderr: style`Error: Invalid module "xxx"
`,
});

testCommand ('bin/doctest test/bin/executable', {
  status: 0,
  stdout: style`
Running doctests in ${1}test/bin/executable${22}...

`,
  stderr: style``,
});

testCommand ("bin/doctest --prefix . --opening-delimiter '```javascript' --closing-delimiter '```' test/transcribe/index.js", {
  status: 0,
  stdout: style`
Running doctests in ${1}test/transcribe/index.js${22}...

`,
  stderr: style``,
});

testCommand ("bin/doctest --coffee --prefix . --opening-delimiter '```coffee' --closing-delimiter '```' test/transcribe/index.coffee", {
  status: 0,
  stdout: style`
Running doctests in ${1}test/transcribe/index.coffee${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --log-function stdout --log-function stderr test/shared/async.js', {
  status: 0,
  stdout: style`
Running doctests in ${1}test/shared/async.js${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --module commonjs --log-function stdout --log-function stderr test/shared/async.js', {
  status: 0,
  stdout: style`
Running doctests in ${1}test/shared/async.js${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --coffee --log-function stdout --log-function stderr test/shared/async.coffee', {
  status: 0,
  stdout: style`
Running doctests in ${1}test/shared/async.coffee${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --log-function stdout --log-function stderr test/logging/index.js', {
  status: 1,
  stdout: style`
Running doctests in ${1}test/logging/index.js${22}...

${7}   29 ${0} ${34}> (stdout (1), 3)${0}
${7}   30 ${0} ${35}stdout (1)${0}
${7}   31 ${0} ${35}stdout (2)${0}
${7}   32 ${0} ${35}return 3${0}

${34}${1}stdout${22} (1)${0}
${34}3${0}
${35}${1}stdout${22} (1)${0}
${35}${1}stdout${22} (2)${0}
${35}3${0}

${7}   36 ${0} ${34}> (stdout (1), stdout (2), 3)${0}
${7}   37 ${0} ${35}stdout (1)${0}
${7}   38 ${0} ${35}return 3${0}

${34}${1}stdout${22} (1)${0}
${34}${1}stdout${22} (2)${0}
${34}3${0}
${35}${1}stdout${22} (1)${0}
${35}3${0}

${7}   42 ${0} ${34}> (stdout (1), stdout (2), 3)${0}
${7}   43 ${0} ${35}stdout (2)${0}
${7}   44 ${0} ${35}stdout (1)${0}
${7}   45 ${0} ${35}return 3${0}

${34}${1}stdout${22} (1)${0}
${34}${1}stdout${22} (2)${0}
${34}3${0}
${35}${1}stdout${22} (2)${0}
${35}${1}stdout${22} (1)${0}
${35}3${0}

${7}   49 ${0} ${34}> (stdout (1), stdout (2), 3)${0}
${7}   50 ${0} ${35}stdout (1)${0}
${7}   51 ${0} ${35}stderr (2)${0}
${7}   52 ${0} ${35}return 3${0}

${34}${1}stdout${22} (1)${0}
${34}${1}stdout${22} (2)${0}
${34}3${0}
${35}${1}stdout${22} (1)${0}
${35}${1}stderr${22} (2)${0}
${35}3${0}

${7}   56 ${0} ${34}> (setTimeout (stdout, 125, 1), 2)${0}
${7}   57 ${0} ${35}return 2${0}
${7}   58 ${0} ${35}stdout (1)${0}

${34}2${0}
${35}2${0}
${35}${1}stdout${22} (1)${0}

`,
  stderr: style``,
});

testCommand ('bin/doctest --module esm lib/doctest.js', {
  status: 0,
  stdout: style`
Running doctests in ${1}lib/doctest.js${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --module esm test/esm/index.js', {
  status: 0,
  stdout: style`
Running doctests in ${1}test/esm/index.js${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --module esm test/esm/dependencies.js', {
  status: 0,
  stdout: style`
Running doctests in ${1}test/esm/dependencies.js${22}...

`,
  stderr: style``,
});

testCommand ('bin/doctest --module esm test/esm/incorrect.js', {
  status: 1,
  stdout: style`
Running doctests in ${1}test/esm/incorrect.js${22}...

${7}    3 ${0} ${34}> toFahrenheit (0)${0}
${7}    4 ${0} ${35}32${0}

${34}"0°F"${0}
${35}32${0}

`,
  stderr: style``,
});

testCommand ('bin/doctest --print test/commonjs/exports/index.js', {
  status: 0,
  stdout: style`
__doctest.enqueue({
  input: {
    lines: [
      {number: 1, text: "> exports.identity(42)"},
    ],
    thunk: ([]) => {
      return (
        exports.identity(42)
      );
    },
  },
  outputs: [
    {
      lines: [
        {number: 2, text: "42"},
      ],
      channel: null,
      thunk: ([]) => {
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
`,
  stderr: style``,
});

testCommand ('bin/doctest --print --module commonjs test/commonjs/exports/index.js', {
  status: 0,
  stdout: style`
__doctest.enqueue({
  input: {
    lines: [
      {number: 1, text: "> exports.identity(42)"},
    ],
    thunk: ([]) => {
      return (
        exports.identity(42)
      );
    },
  },
  outputs: [
    {
      lines: [
        {number: 2, text: "42"},
      ],
      channel: null,
      thunk: ([]) => {
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
`,
  stderr: style``,
});
