'use strict';

var common = require ('./common');
var program = require ('./program');
var doctest = require ('..');


if (program.module === 'esm') {
  process.stderr.write (
    common.formatErrors ([
      'Node.js v' +
      process.versions.node +
      ' does not support ECMAScript modules (supported since v9.0.0)'
    ])
  );
  process.exit (1);
}

common.runDoctests (doctest, program);
