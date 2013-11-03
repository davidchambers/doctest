program = require 'commander'

doctest = require '../lib/doctest'


program
  .version(doctest.version)
  .usage('file [file ...]\n\n  `file` must be a .js or .coffee file.')
  .parse(process.argv)

doctest program.args...
