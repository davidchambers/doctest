program = require 'commander'
R       = require 'ramda'

doctest = require '../lib/doctest'
pkg     = require '../package.json'


program
.version pkg.version
.usage '[options] path/to/js/or/coffee/module'
.option '-m, --module <type>', 'specify module system ("amd" or "commonjs")'
.option '    --nodejs', 'pass options directly to the "node" binary'
.option '-p, --print', 'output the rewritten source without running tests'
.option '-s, --silent', 'suppress output'
.option '-t, --type <type>', 'specify file type ("coffee" or "js")'
.parse process.argv


validators =
  module: R.contains R.__, [undefined, 'amd', 'commonjs']
  print:  R.always yes
  silent: R.always yes
  type:   R.contains R.__, [undefined, 'coffee', 'js']

keys = R.keys(validators).sort()
options = R.pick keys, program
keys.forEach (key) ->
  unless validators[key] options[key]
    process.stderr.write "\n  error: invalid #{key} `#{options[key]}'\n\n"
    process.exit 1


failures = R.reduce (failures, path) ->
  try
    results = doctest path, options
  catch err
    process.stderr.write \
      # Format output to match commander.
      "\n  error: #{err.message[0].toLowerCase()}#{err.message[1..]}\n\n"
    process.exit 1
  failures + R.length R.reject R.identity, R.map R.head, results
, 0, program.args

process.exit if failures is 0 then 0 else 1
