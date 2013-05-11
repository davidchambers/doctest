optimist = require 'optimist'

usage = '''

  Usage: doctest file [file ...]

  `file` must be a JavaScript or CoffeeScript file with the appropriate
  extension.
'''

{argv} = optimist.usage(usage).options
  h: alias: 'help'
  d: alias: 'dump'

if argv.help or argv._.length is 0 then optimist.showHelp()
else
  doctest = require('../lib/doctest')
  if argv.dump
    doctest.dump = true
  doctest.apply(null, argv._)
