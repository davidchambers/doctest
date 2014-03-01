program = require 'commander'
_       = require 'underscore'

doctest = require '../lib/doctest'


program
.version doctest.version
.usage '[options] path/to/js/or/coffee/module'
.option '-m, --module <type>', 'specify module system ("amd" or "commonjs")'
.option '-s, --silent', 'suppress output'
.option '-t, --type <type>', 'specify file type ("coffee" or "js")'
.parse process.argv


validators =
  module: _.partial _.contains, [undefined, 'amd', 'commonjs']
  silent: _.constant yes
  type:   _.partial _.contains, [undefined, 'coffee', 'js']

keys = _.keys(validators).sort()
options = _.pick program, keys
_.each keys, (key) ->
  unless validators[key] options[key]
    process.stderr.write "\n  error: invalid #{key} `#{options[key]}'\n\n"
    process.exit 1


process.exit _.reduce program.args, (failures, path) ->
  try
    results = doctest path, options
  catch err
    process.stderr.write \
      # Format output to match commander.
      "\n  error: #{err.message[0].toLowerCase()}#{err.message[1..]}\n\n"
    process.exit 1
  failures + _.reject(_.map(results, _.first), _.identity).length
, 0
