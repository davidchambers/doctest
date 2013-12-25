{exec}  = require 'child_process'
pathlib = require 'path'

_       = require 'underscore'

doctest = require '../lib/doctest'


gray = green = red = reset = ''
unless process.env.NODE_DISABLE_COLORS or process.platform is 'win32'
  gray  = '\x1B[0;37m'
  green = '\x1B[0;32m'
  red   = '\x1B[0;31m'
  reset = '\x1B[0m'


printResult = (actual, expected, message) ->
  if _.isEqual actual, expected
    console.log "#{green} \u2714 #{gray} #{message}#{reset}"
  else
    console.warn  "#{red} \u2718 #{gray} #{message}#{reset}"
    console.log  "#{gray}      expected: #{green}#{expected}#{reset}"
    console.log  "#{gray}      received: #{red}#{actual}#{reset}"


testModule = (path, options) ->
  doctest path, options, (results) ->
    for [message, expected], idx in require pathlib.resolve path, '../results'
      printResult results[idx], expected, message


testCommand = (command, expected) ->
  child = exec command, (err, stdout) ->
    code = if err? then err.code else 0
    if code isnt expected.code
      printResult code, expected.code, command
    else
      printResult stdout, expected.output, command


testModule 'test/shared/index.js'
testModule 'test/shared/index.coffee'
testModule 'test/amd/index.js', module: 'amd'
testModule 'test/commonjs/require/index.js', module: 'commonjs'
testModule 'test/commonjs/exports/index.js', module: 'commonjs'
testModule 'test/commonjs/module.exports/index.js', module: 'commonjs'

testCommand 'bin/doctest test/shared/index.js',
  code: 4
  output: '''
    retrieving test/shared/index.js...
    running doctests in index.js...
    ......x.x...........x.x

  '''
testCommand 'bin/doctest test/shared/index.coffee',
  code: 4
  output: '''
    retrieving test/shared/index.coffee...
    running doctests in index.coffee...
    ......x.x...........x.x

  '''
testCommand 'bin/doctest test/shared/index.js test/shared/index.coffee',
  code: 8
  output: '''
    retrieving test/shared/index.js...
    running doctests in index.js...
    ......x.x...........x.x
    retrieving test/shared/index.coffee...
    running doctests in index.coffee...
    ......x.x...........x.x

  '''
