program = require 'commander'
_       = require 'underscore'

doctest = require '../lib/doctest'


program
  .version(doctest.version)
  .usage('[options] path/to/js/or/coffee/module')
  .option('-m, --module [type]', 'specify module system ("amd" or "commonjs")')
  .parse(process.argv)

options = _.pick program, ['module']

doctest path, options for path in program.args
