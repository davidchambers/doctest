pathlib = require 'path'

_       = require 'underscore'

doctest = require '../lib/doctest'


gray = green = red = reset = ''
unless process.env.NODE_DISABLE_COLORS or process.platform is 'win32'
  gray  = '\x1B[0;37m'
  green = '\x1B[0;32m'
  red   = '\x1B[0;31m'
  reset = '\x1B[0m'


testModule = (path) ->
  doctest path, (results) ->
    for [message, expected], idx in require pathlib.resolve path, '../results'
      actual = results[idx]
      if _.isEqual actual, expected
        console.log "#{green} \u2714 #{gray} #{message}#{reset}"
      else
        console.warn  "#{red} \u2718 #{gray} #{message}#{reset}"
        console.log  "#{gray}      expected: #{green}#{expected}#{reset}"
        console.log  "#{gray}      received: #{red}#{actual}#{reset}"


testModule 'test/shared/index.js'
testModule 'test/shared/index.coffee'
testModule 'test/amd/index.js'
