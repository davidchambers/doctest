'use strict';

var program = require ('commander');

var doctest = require ('..');
var pkg = require ('../package.json');


program
.version (pkg.version)
.usage ('[options] path/to/js/or/coffee/module')
.option ('-m, --module <type>',
         'specify module system ("amd" or "commonjs")')
.option ('    --nodejs <options>',
         'pass options directly to the "node" binary')
.option ('    --prefix <prefix>',
         'specify Transcribe-style prefix (e.g. ".")')
.option ('-p, --print',
         'output the rewritten source without running tests')
.option ('-s, --silent',
         'suppress output')
.option ('-t, --type <type>',
         'specify file type ("coffee" or "js")')
.parse (process.argv);

//  formatErrors :: Array String -> String
function formatErrors(errors) {
  return (errors.map (function(s) { return 'error: ' + s + '\n'; })).join ('');
}

var errors = [];
if (program.module != null &&
    program.module !== 'amd' &&
    program.module !== 'commonjs') {
  errors.push ('Invalid module `' + program.module + "'");
}
if (program.type != null &&
    program.type !== 'coffee' &&
    program.type !== 'js') {
  errors.push ('Invalid type `' + program.type + "'");
}
if (errors.length > 0) {
  process.stderr.write (formatErrors (errors));
  process.exit (1);
}

process.exit (program.args.reduce (function(status, path) {
  var results;
  try {
    results = doctest (path, program);
  } catch (err) {
    process.stderr.write (formatErrors ([err.message]));
    process.exit (1);
  }
  return results.reduce (function(status, tuple) {
    return tuple[0] ? status : 1;
  }, status);
}, 0));
