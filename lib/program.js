import program from 'commander';
import Z from 'sanctuary-type-classes';

import require from './require.js';


const pkg = require ('../package.json');

program
.version (pkg.version)
.usage ('[options] path/to/js/or/coffee/module')
.option ('-m, --module <type>',
         'specify module system ("commonjs" or "esm")')
.option ('    --coffee',
         'parse CoffeeScript files')
.option ('    --prefix <prefix>',
         'specify Transcribe-style prefix (e.g. ".")')
.option ('    --opening-delimiter <delimiter>',
         'specify line preceding doctest block (e.g. "```javascript")')
.option ('    --closing-delimiter <delimiter>',
         'specify line following doctest block (e.g. "```")')
.option ('    --log-function <name>',
         'expose a log function with the given name to your doctests' +
         ' (can be specified multiple times)',
         Z.append,
         [])
.option ('    --timeout <milliseconds>',
         'specify an alternative log timeout time (defaults to 100)')
.option ('-p, --print',
         'output the rewritten source without running tests')
.option ('-s, --silent',
         'suppress output')
.parse (process.argv);

program.logFunctions = program.logFunction;
delete program.logFunction;

export default program;
