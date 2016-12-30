'use strict';

var program = require('commander');
var R       = require('ramda');

var doctest = require('../lib/doctest');
var pkg     = require('../package.json');


program
.version(pkg.version)
.usage('[options] path/to/js/or/coffee/module')
.option('-m, --module <type>', 'specify module system ("amd" or "commonjs")')
.option('    --nodejs <options>', 'pass options directly to the "node" binary')
.option('    --prefix <prefix>', 'specify Transcribe-style prefix (e.g. ".")')
.option('-p, --print', 'output the rewritten source without running tests')
.option('-s, --silent', 'suppress output')
.option('-t, --type <type>', 'specify file type ("coffee" or "js")')
.parse(process.argv);


var validators = {
  module: R.contains(R.__, [undefined, 'amd', 'commonjs']),
  prefix: R.T,
  print:  R.T,
  silent: R.T,
  type:   R.contains(R.__, [undefined, 'coffee', 'js'])
};

var keys = R.keys(validators).sort();
var options = R.pick(keys, program);
keys.forEach(function(key) {
  if (!validators[key](options[key])) {
    process.stderr.write('\n  error: invalid ' + key +
                         ' `' + options[key] + "'\n\n");
    process.exit(1);
  }
});


var failures = R.reduce(function(failures, path) {
  var results;
  try {
    results = doctest(path, options);
  } catch (err) {
    process.stderr.write('\n  error: ' + err.message[0].toLowerCase() +
                         err.message.slice(1) + '\n\n');
    process.exit(1);
  }
  return failures + R.length(R.reject(R.identity, R.map(R.head, results)));
}, 0, program.args);

process.exit(failures === 0 ? 0 : 1);
