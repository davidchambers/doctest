'use strict';

var program = require ('commander');

var pkg = require ('../package.json');


function append(x, xs) {
  return xs.concat ([x]);
}

program
.version (pkg.version)
.usage ('[options] path/to/js/or/coffee/module')
.option ('-m, --module <type>',
         'specify module system ("amd", "commonjs", or "esm")')
.option ('    --nodejs <options>',
         'pass options directly to the "node" binary')
.option ('    --prefix <prefix>',
         'specify Transcribe-style prefix (e.g. ".")')
.option ('    --opening-delimiter <delimiter>',
         'specify line preceding doctest block (e.g. "```javascript")')
.option ('    --closing-delimiter <delimiter>',
         'specify line following doctest block (e.g. "```")')
.option ('    --log-function <name>',
         'expose a log function with the given name to your doctests' +
         ' (can be specified multiple times)',
         append,
         [])
.option ('    --log-timeout <milliseconds>',
         'specify an alternative log timeout time (defaults to 100)',
         100)
.option ('-p, --print',
         'output the rewritten source without running tests')
.option ('-s, --silent',
         'suppress output')
.option ('-t, --type <type>',
         'specify file type for non-esm module systems ("coffee" or "js")')
.parse (process.argv);

module.exports = program;
