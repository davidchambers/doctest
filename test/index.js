'use strict';

var execSync = (require ('child_process')).execSync;
var pathlib = require ('path');

var Z = require ('sanctuary-type-classes');

var doctest = require ('..');


//  unlines :: Array String -> String
function unlines(lines) {
  return lines.reduce (function(s, line) { return s + line + '\n'; }, '');
}


var gray  = '';
var green = '';
var red   = '';
var reset = '';
if (!process.env.NODE_DISABLE_COLORS && process.platform !== 'win32') {
  gray  = '\u001B[0;37m';
  green = '\u001B[0;32m';
  red   = '\u001B[0;31m';
  reset = '\u001B[0m';
}


var failures = 0;

function printResult(actual, expected, message) {
  if (Z.equals (actual, expected)) {
    return console.log (green + ' \u2714 ' + gray + ' ' + message + reset);
  } else {
    failures += 1;
    console.warn (red + ' \u2718 ' + gray + ' ' + message + reset);
    console.log (gray + '      expected: ' + green + expected + reset);
    return console.log (gray + '      received: ' + red + actual + reset);
  }
}


var defaultOptions = {
  logFunction: []
};

function testModule(path, options) {
  var type = (path.split ('.')).pop ();
  var expecteds = require (pathlib.resolve (path, '..', 'results.json'));
  return (doctest (path, Object.assign ({}, defaultOptions, options)))
  .then (function(actuals) {
    for (var idx = 0; idx < expecteds.length; idx += 1) {
      printResult (actuals[idx],
                   expecteds[idx][1],
                   expecteds[idx][0] + ' [' + type + ']');
    }
  });
}


function testCommand(command, expected) {
  var status = 0;
  var stdout;
  var stderr = '';
  try {
    stdout = execSync (
      command + ' --nodejs --no-warnings',
      {encoding: 'utf8', stdio: 'pipe'}
    );
  } catch (err) {
    status = err.status;
    stdout = err.stdout;
    stderr = err.stderr;
  }
  printResult (status, expected.status, command + ' [status]');
  printResult (stdout, expected.stdout, command + ' [stdout]');
  printResult (stderr, expected.stderr, command + ' [stderr]');
}

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
  testModule ('test/bin/executable', {type: 'js', silent: true}),
  testModule ('test/harmony/index.js', {silent: true})
]);

testCommand ('bin/doctest', {
  status: 1,
  stdout: '',
  stderr: unlines ([
    'error: No files for doctesting provided'
  ])
});

testCommand ('bin/doctest --xxx', {
  status: 1,
  stdout: '',
  stderr: unlines ([
    "error: unknown option `--xxx'"
  ])
});

testCommand ('bin/doctest file.js --type', {
  status: 1,
  stdout: '',
  stderr: unlines ([
    "error: option `-t, --type <type>' argument missing"
  ])
});

testCommand ('bin/doctest file.js --type xxx', {
  status: 1,
  stdout: '',
  stderr: unlines ([
    "error: Invalid type `xxx'"
  ])
});

testCommand ('bin/doctest test/shared/index.js', {
  status: 1,
  stdout: unlines ([
    'running doctests in test/shared/index.js...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")'
  ]),
  stderr: ''
});

testCommand ('bin/doctest test/shared/index.coffee', {
  status: 1,
  stdout: unlines ([
    'running doctests in test/shared/index.coffee...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")'
  ]),
  stderr: ''
});

testCommand ('bin/doctest test/shared/index.js test/shared/index.coffee', {
  status: 1,
  stdout: unlines ([
    'running doctests in test/shared/index.js...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")',
    'running doctests in test/shared/index.coffee...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --silent test/shared/index.js', {
  status: 1,
  stdout: '',
  stderr: ''
});

testCommand ('bin/doctest test/bin/executable', {
  status: 1,
  stdout: '',
  stderr: unlines ([
    'error: Cannot infer type from extension'
  ])
});

testCommand ('bin/doctest --type js test/bin/executable', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/bin/executable...',
    '.'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --log-function stdout --log-function stderr test/shared/async.js', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/shared/async.js...',
    '....'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module commonjs --log-function stdout --log-function stderr test/shared/async.js', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/shared/async.js...',
    '....'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --log-function stdout --log-function stderr test/shared/async.coffee', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/shared/async.coffee...',
    '....'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --log-function stdout --log-function stderr test/shared/logging.js', {
  status: 1,
  stdout: unlines ([
    'running doctests in test/shared/logging.js...',
    '...........xx.xxxx..x..x..',
    'FAIL: expected [stdout]: 2 on line 42 (got 3)',
    'FAIL: expected 3 on line 43 (got no output)',
    'FAIL: expected 3 on line 49 (got [stdout]: 2)',
    'FAIL: expected no output on line - (got 3)',
    'FAIL: expected [stdout]: 2 on line 54 (got [stdout]: 1)',
    'FAIL: expected [stdout]: 1 on line 55 (got [stdout]: 2)',
    'FAIL: expected [stderr]: 2 on line 62 (got [stdout]: 2)',
    'FAIL: expected [stdout]: 1 on line 69 (got no output fast enough)'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module commonjs lib/doctest.js', {
  status: 0,
  stdout: unlines ([
    'running doctests in lib/doctest.js...',
    '......'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module esm test/esm/index.mjs', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/esm/index.mjs...',
    '.'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module esm test/esm/dependencies.mjs', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/esm/dependencies.mjs...',
    '.'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module esm test/esm/incorrect.mjs', {
  status: 1,
  stdout: unlines ([
    'running doctests in test/esm/incorrect.mjs...',
    'x',
    'FAIL: expected 32 on line 4 (got "0°F")'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module esm test/esm/async.mjs', {
  status: 1,
  stdout: unlines ([
    'running doctests in test/esm/async.mjs...',
    'x',
    'FAIL: expected undefined on line 6 (got ! ReferenceError: stdout is not defined)'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --module esm --log-function stdout --log-function stderr test/esm/async.mjs', {
  status: 0,
  stdout: unlines ([
    'running doctests in test/esm/async.mjs...',
    '....'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --print test/commonjs/exports/index.js', {
  status: 0,
  stdout: unlines ([
    '__doctest.enqueue({',
    '  type: "input",',
    '  thunk: function() {',
    '    return (',
    '      exports.identity(42)',
    '    );',
    '  }',
    '});',
    '__doctest.enqueue({',
    '  type: "output",',
    '  "!": false,',
    '  thunk: function() {',
    '    return [',
    '      {',
    '        loc: 2,',
    '        channel: null,',
    '        value: (',
    '          42',
    '        )',
    '      }',
    '    ];',
    '  }',
    '});',
    'exports.identity = function(x) {',
    '  return x;',
    '};'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --print --module amd test/amd/index.js', {
  status: 0,
  stdout: unlines ([
    'define(function() {',
    '  // Convert degrees Celsius to degrees Fahrenheit.',
    '  //',
    '  __doctest.enqueue({',
    '  type: "input",',
    '  thunk: function() {',
    '    return (',
    '      toFahrenheit(0)',
    '    );',
    '  }',
    '});',
    '__doctest.enqueue({',
    '  type: "output",',
    '  "!": false,',
    '  thunk: function() {',
    '    return [',
    '      {',
    '        loc: 5,',
    '        channel: null,',
    '        value: (',
    '          32',
    '        )',
    '      }',
    '    ];',
    '  }',
    '});',
    '  function toFahrenheit(degreesCelsius) {',
    '    return degreesCelsius * 9 / 5 + 32;',
    '  }',
    '  return toFahrenheit;',
    '});',
    '',
    'function define() {',
    '  for (var idx = 0; idx < arguments.length; idx += 1) {',
    '    if (typeof arguments[idx] == "function") {',
    '      arguments[idx]();',
    '      break;',
    '    }',
    '  }',
    '}'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --print --module commonjs test/commonjs/exports/index.js', {
  status: 0,
  stdout: unlines ([
    'void function() {',
    '  var __doctest = {',
    '    require: require,',
    '    queue: [],',
    '    enqueue: function(io) { this.queue.push(io); }',
    '  };',
    '',
    '  void function() {',
    '    __doctest.enqueue({',
    '      type: "input",',
    '      thunk: function() {',
    '        return (',
    '          exports.identity(42)',
    '        );',
    '      }',
    '    });',
    '    __doctest.enqueue({',
    '      type: "output",',
    '      "!": false,',
    '      thunk: function() {',
    '        return [',
    '          {',
    '            loc: 2,',
    '            channel: null,',
    '            value: (',
    '              42',
    '            )',
    '          }',
    '        ];',
    '      }',
    '    });',
    '    exports.identity = function(x) {',
    '      return x;',
    '    };',
    '  }.call(this);',
    '',
    '  (module.exports || exports).__doctest = __doctest;',
    '}.call(this);'
  ]),
  stderr: ''
});

testCommand ('bin/doctest --print --module commonjs --log-function stdout --log-function stderr test/commonjs/exports/index.js', {
  status: 0,
  stdout: unlines ([
    'void function() {',
    '  var __doctest = {',
    '    require: require,',
    '    queue: [],',
    '    enqueue: function(io) { this.queue.push(io); }',
    '  };',
    '',
    '  void function() {',
    '    __doctest.enqueue({',
    '      type: "input",',
    '      thunk: function(stdout, stderr) {',
    '        return (',
    '          exports.identity(42)',
    '        );',
    '      }',
    '    });',
    '    __doctest.enqueue({',
    '      type: "output",',
    '      "!": false,',
    '      thunk: function() {',
    '        return [',
    '          {',
    '            loc: 2,',
    '            channel: null,',
    '            value: (',
    '              42',
    '            )',
    '          }',
    '        ];',
    '      }',
    '    });',
    '    exports.identity = function(x) {',
    '      return x;',
    '    };',
    '  }.call(this);',
    '',
    '  (module.exports || exports).__doctest = __doctest;',
    '}.call(this);'
  ]),
  stderr: ''
});

moduleTests.then (function() {
  process.stdout.write (
    failures === 0 ? '\n  ' + green + '0 test failures' + reset + '\n\n' :
    failures === 1 ? '\n  ' + red + '1 test failure' + reset + '\n\n' :
    /* otherwise */  '\n  ' + red + failures + ' test failures' + reset + '\n\n'
  );
  process.exit (failures === 0 ? 0 : 1);
});
