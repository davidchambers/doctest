optimist = require 'optimist'

usage = '''

  Usage: doctest file [file ...]

  `file` must be a JavaScript or CoffeeScript file with the appropriate
  extension.
'''

{argv} = optimist.usage(usage).options
  h: alias: 'help'

if argv.help or argv._.length is 0 then optimist.showHelp()
else require('../lib/doctest').apply(null, argv._)
