program = require 'commander'

doctest = require '../lib/doctest'


program
  .version(doctest.version)
  .usage('path/to/js/or/coffee/module')
  .parse(process.argv)

doctest path for path in program.args
