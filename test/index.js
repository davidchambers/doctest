'use strict';

const {execSync} = require ('child_process');
const {resolve} = require ('path');

const Z = require ('sanctuary-type-classes');

const doctest = require ('..');


let gray  = '';
let green = '';
let red   = '';
let reset = '';
if (!process.env.NODE_DISABLE_COLORS && process.platform !== 'win32') {
  gray  = '\u001B[0;37m';
  green = '\u001B[0;32m';
  red   = '\u001B[0;31m';
  reset = '\u001B[0m';
}

let failures = 0;

const printResult = (actual, expected, message) => {
  if (Z.equals (actual, expected)) {
    console.log (`${green} \u2714 ${gray} ${message}${reset}`);
  } else {
    failures += 1;
    console.warn (`${red} \u2718 ${gray} ${message}${reset}`);
    console.log (`${gray}      expected: ${green}${expected}${reset}`);
    console.log (`${gray}      received: ${red}${actual}${reset}`);
  }
};

const testModule = (path, options) => {
  const type = (path.split ('.')).pop ();
  return doctest (options) (path)
  .then (actuals => {
    require (resolve (path, '..', 'results.json'))
    .forEach (([description, expected], idx) => {
      printResult (actuals[idx], expected, `${description} [${type}]`);
    });
  });
};

const testCommand = (command, expected) => {
  const actual = (() => {
    const options = {encoding: 'utf8', stdio: 'pipe'};
    try {
      return {
        status: 0,
        stdout: execSync (`${command} --nodejs --no-warnings`, options),
        stderr: '',
      };
    } catch (err) {
      return err;
    }
  }) ();
  printResult (actual.status, expected.status, `${command} [status]`);
  printResult (actual.stdout, expected.stdout, `${command} [stdout]`);
  printResult (actual.stderr, expected.stderr, `${command} [stderr]`);
};

const moduleTests = Promise.all ([
  testModule ('test/shared/index.js', {silent: true}),
  testModule ('test/shared/index.coffee', {silent: true}),
  testModule ('test/line-endings/CR.js', {silent: true}),
  testModule ('test/line-endings/CR.coffee', {silent: true}),
  testModule ('test/line-endings/CR+LF.js', {silent: true}),
  testModule ('test/line-endings/CR+LF.coffee', {silent: true}),
  testModule ('test/line-endings/LF.js', {silent: true}),
  testModule ('test/line-endings/LF.coffee', {silent: true}),
  testModule ('test/exceptions/index.js', {silent: true}),
  testModule ('test/statements/index.js', {silent: true}),
  testModule ('test/fantasy-land/index.js', {silent: true}),
  testModule ('test/transcribe/index.js', {prefix: '.', openingDelimiter: '```javascript', closingDelimiter: '```', silent: true}),
  testModule ('test/transcribe/index.coffee', {prefix: '.', openingDelimiter: '```coffee', closingDelimiter: '```', silent: true}),
  testModule ('test/amd/index.js', {module: 'amd', silent: true}),
  testModule ('test/commonjs/require/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/commonjs/exports/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/commonjs/module.exports/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/commonjs/strict/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/commonjs/__dirname/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/commonjs/__filename/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/commonjs/__doctest.require/index.js', {module: 'commonjs', silent: true}),
  testModule ('test/bin/executable', {type: 'js', silent: true}),
  testModule ('test/es2015/index.js', {silent: true}),
  testModule ('test/es2018/index.js', {silent: true}),
  Number ((process.versions.node.split ('.'))[0]) >= 14
  ? testModule ('test/es2020/index.js', {silent: true})
  : Promise.resolve (undefined),
]);

testCommand ('bin/doctest', {
  status: 1,
  stdout: '',
  stderr: `error: No files for doctesting provided
`,
});

testCommand ('bin/doctest --xxx', {
  status: 1,
  stdout: '',
  stderr: `error: unknown option \`--xxx'
`,
});

testCommand ('bin/doctest file.js --type', {
  status: 1,
  stdout: '',
  stderr: `error: option \`-t, --type <type>' argument missing
`,
});

testCommand ('bin/doctest file.js --type xxx', {
  status: 1,
  stdout: '',
  stderr: `error: Invalid type \`xxx'
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

testCommand ('bin/doctest test/shared/index.coffee', {
  status: 1,
  stdout: `running doctests in test/shared/index.coffee...
......x.x...........x........x
FAIL: expected 5 on line 31 (got 4)
FAIL: expected ! TypeError on line 38 (got 0)
FAIL: expected 9.5 on line 97 (got 5)
FAIL: expected "on automatic semicolon insertion" on line 155 (got "the rewriter should not rely")
`,
  stderr: '',
});

testCommand ('bin/doctest test/shared/index.js test/shared/index.coffee', {
  status: 1,
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
  stderr: '',
});

testCommand ('bin/doctest --silent test/shared/index.js', {
  status: 1,
  stdout: '',
  stderr: '',
});

testCommand ('bin/doctest test/bin/executable', {
  status: 1,
  stdout: '',
  stderr: `error: Cannot infer type from extension
`,
});

testCommand ('bin/doctest --type js test/bin/executable', {
  status: 0,
  stdout: `running doctests in test/bin/executable...
.
`,
  stderr: '',
});

testCommand ('bin/doctest --module commonjs lib/doctest.js', {
  status: 0,
  stdout: `running doctests in lib/doctest.js...
...
`,
  stderr: '',
});

testCommand ('bin/doctest --module esm test/esm/index.mjs', {
  status: 0,
  stdout: `running doctests in test/esm/index.mjs...
.
`,
  stderr: '',
});

testCommand ('bin/doctest --module esm test/esm/dependencies.mjs', {
  status: 0,
  stdout: `running doctests in test/esm/dependencies.mjs...
.
`,
  stderr: '',
});

testCommand ('bin/doctest --module esm test/esm/incorrect.mjs', {
  status: 1,
  stdout: `running doctests in test/esm/incorrect.mjs...
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

testCommand ('bin/doctest --print --module amd test/amd/index.js', {
  status: 0,
  stdout: `
define(function() {
  // Convert degrees Celsius to degrees Fahrenheit.
  //

__doctest.enqueue({
  type: "input",
  thunk: () => {
    return toFahrenheit(0);
  },
});

__doctest.enqueue({
  type: "output",
  ":": 5,
  "!": false,
  thunk: () => {
    return 32;
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

  (module.exports || exports).__doctest = __doctest;
})();
`,
  stderr: '',
});

moduleTests.then (() => {
  process.stdout.write (
    failures === 0 ? `\n  ${green}0 test failures${reset}\n\n` :
    failures === 1 ? `\n  ${red}1 test failure${reset}\n\n` :
    /* otherwise */  `\n  ${red}${failures} test failures${reset}\n\n`
  );
  process.exit (failures === 0 ? 0 : 1);
});
