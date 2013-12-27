program = require 'commander'
_       = require 'underscore'

doctest = require '../lib/doctest'


program
  .version(doctest.version)
  .usage('[options] path/to/js/or/coffee/module')
  .option('-m, --module [type]', 'specify module system ("amd" or "commonjs")')
  .option('-s, --silent', 'suppress output')
  .parse(process.argv)

options = _.pick program, ['module', 'silent']

process.exit _.reduce program.args, (failures, path) ->
  results = doctest path, options
  failures + _.reject(_.map(results, _.first), _.identity).length
, 0
