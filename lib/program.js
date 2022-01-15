import program from 'commander';

import require from './require.js';


const pkg = require ('../package.json');

program
.version (pkg.version)
.usage ('[options] path/to/js/or/coffee/module')
.option ('-m, --module <type>',
         'specify module system ("amd", "commonjs", or "esm")')
.option ('    --coffee',
         'parse CoffeeScript files')
.option ('    --nodejs <options>',
         'pass options directly to the "node" binary')
.option ('    --prefix <prefix>',
         'specify Transcribe-style prefix (e.g. ".")')
.option ('    --opening-delimiter <delimiter>',
         'specify line preceding doctest block (e.g. "```javascript")')
.option ('    --closing-delimiter <delimiter>',
         'specify line following doctest block (e.g. "```")')
.option ('-p, --print',
         'output the rewritten source without running tests')
.option ('-s, --silent',
         'suppress output')
.parse (process.argv);

export default program;
