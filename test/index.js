'use strict';

/* jshint es3: false, node: true */

var execSync  = require('child_process').execSync;
var pathlib   = require('path');

var R         = require('ramda');
var semver    = require('semver');

var doctest   = require('../lib/doctest');


//  unlines :: [String] -> String
var unlines = R.compose(R.join(''), R.map(R.concat(R.__, '\n')));


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

var printResult = function(actual, expected, message) {
  if (R.equals(actual, expected)) {
    return console.log(green + ' \u2714 ' + gray + ' ' + message + reset);
  } else {
    failures += 1;
    console.warn(red + ' \u2718 ' + gray + ' ' + message + reset);
    console.log(gray + '      expected: ' + green + expected + reset);
    return console.log(gray + '      received: ' + red + actual + reset);
  }
};


var testModule = function(path, options) {
  var type = R.last(R.split('.', path));
  doctest(path, R.assoc('silent', true, options), function(results) {
    R.addIndex(R.forEach)(function(pair, idx) {
      printResult(results[idx], pair[1], pair[0] + ' [' + type + ']');
    }, require(pathlib.resolve(path, '../results')));
  });
};


var testCommand = function(command, expected) {
  var status = 0;
  var stdout;
  var stderr = '';
  try {
    stdout = execSync(command, {encoding: 'utf8', stdio: 'pipe'});
  } catch (err) {
    status = err.status;
    stdout = err.stdout;
    stderr = err.stderr;
  }
  printResult(status, expected.status, command + ' [status]');
  printResult(stdout, expected.stdout, command + ' [stdout]');
  printResult(stderr, expected.stderr, command + ' [stderr]');
};


testModule('test/shared/index.js');
testModule('test/shared/index.coffee');
testModule('test/line-endings/CR.js');
testModule('test/line-endings/CR.coffee');
testModule('test/line-endings/CR+LF.js');
testModule('test/line-endings/CR+LF.coffee');
testModule('test/line-endings/LF.js');
testModule('test/line-endings/LF.coffee');
testModule('test/exceptions/index.js');
testModule('test/amd/index.js', {module: 'amd'});
testModule('test/commonjs/require/index.js', {module: 'commonjs'});
testModule('test/commonjs/exports/index.js', {module: 'commonjs'});
testModule('test/commonjs/module.exports/index.js', {module: 'commonjs'});
testModule('test/commonjs/strict/index.js', {module: 'commonjs'});
testModule('test/bin/executable', {type: 'js'});
if (semver.gte(process.version, '0.12.0')) {
  testModule('test/harmony/index.js');
}

testCommand('bin/doctest --xxx', {
  status: 1,
  stdout: '',
  stderr: "\n  error: unknown option `--xxx'\n\n"
});

testCommand('bin/doctest --type', {
  status: 1,
  stdout: '',
  stderr: "\n  error: option `-t, --type <type>' argument missing\n\n"
});

testCommand('bin/doctest --type xxx', {
  status: 1,
  stdout: '',
  stderr: "\n  error: invalid type `xxx'\n\n"
});

testCommand('bin/doctest test/shared/index.js', {
  status: 1,
  stdout: unlines([
    'retrieving test/shared/index.js...',
    'running doctests in index.js...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")'
  ]),
  stderr: ''
});

testCommand('bin/doctest test/shared/index.coffee', {
  status: 1,
  stdout: unlines([
    'retrieving test/shared/index.coffee...',
    'running doctests in index.coffee...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")'
  ]),
  stderr: ''
});

testCommand('bin/doctest test/shared/index.js test/shared/index.coffee', {
  status: 1,
  stdout: unlines([
    'retrieving test/shared/index.js...',
    'running doctests in index.js...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")',
    'retrieving test/shared/index.coffee...',
    'running doctests in index.coffee...',
    '......x.x...........x........x',
    'FAIL: expected 5 on line 31 (got 4)',
    'FAIL: expected ! TypeError on line 38 (got 0)',
    'FAIL: expected 9.5 on line 97 (got 5)',
    'FAIL: expected "on automatic semicolon insertion" on line 155 ' +
      '(got "the rewriter should not rely")'
  ]),
  stderr: ''
});

testCommand('bin/doctest --silent test/shared/index.js', {
  status: 1,
  stdout: '',
  stderr: ''
});

testCommand('bin/doctest --silent test/bin/executable', {
  status: 1,
  stdout: '',
  stderr: '\n  error: cannot infer type from extension\n\n'
});

testCommand('bin/doctest --type js --silent test/bin/executable', {
  status: 0,
  stdout: '',
  stderr: ''
});

testCommand('bin/doctest --module commonjs --silent lib/doctest.js', {
  status: 0,
  stdout: '',
  stderr: ''
});

testCommand('bin/doctest --print test/commonjs/exports/index.js', {
  status: 0,
  stdout: unlines([
    '__doctest.enqueue({',
    '  type: "input",',
    '  thunk: function() {',
    '    return exports.identity(42);',
    '  }',
    '});',
    '__doctest.enqueue({',
    '  type: "output",',
    '  ":": 2,',
    '  "!": false,',
    '  thunk: function() {',
    '    return 42;',
    '  }',
    '});',
    'exports.identity = function(x) {',
    '  return x;',
    '};'
  ]),
  stderr: ''
});

testCommand('bin/doctest --print --module amd test/amd/index.js', {
  status: 0,
  stdout: unlines([
    'define(function() {',
    '  // Convert degrees Celsius to degrees Fahrenheit.',
    '  //',
    '  __doctest.enqueue({',
    '  type: "input",',
    '  thunk: function() {',
    '    return toFahrenheit(0);',
    '  }',
    '});',
    '__doctest.enqueue({',
    '  type: "output",',
    '  ":": 5,',
    '  "!": false,',
    '  thunk: function() {',
    '    return 32;',
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

testCommand(
  'bin/doctest --print --module commonjs test/commonjs/exports/index.js', {
  status: 0,
  stdout: unlines([
    'void function() {',
    '  var __doctest = {',
    '    queue: [],',
    '    enqueue: function(io) { this.queue.push(io); }',
    '  };',
    '',
    '  void function() {',
    '    __doctest.enqueue({',
    '      type: "input",',
    '      thunk: function() {',
    '        return exports.identity(42);',
    '      }',
    '    });',
    '    __doctest.enqueue({',
    '      type: "output",',
    '      ":": 2,',
    '      "!": false,',
    '      thunk: function() {',
    '        return 42;',
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


process.stdout.write(
  failures === 0 ? '\n  ' + green + '0 test failures' + reset + '\n\n' :
  failures === 1 ? '\n  ' + red + '1 test failure' + reset + '\n\n' :
  /* otherwise */  '\n  ' + red + failures + ' test failures' + reset + '\n\n'
);
process.exit(failures === 0 ? 0 : 1);
