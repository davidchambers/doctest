{isEqual} = require 'underscore'

doctest   = require '../lib/doctest'
tests     = require './tests'


gray = green = red = reset = ''
unless process.env.NODE_DISABLE_COLORS or process.platform is 'win32'
  gray  = '\x1B[0;37m'
  green = '\x1B[0;32m'
  red   = '\x1B[0;31m'
  reset = '\x1B[0m'

queue = ['test/test.js', 'test/test.coffee']
queue.pop() # TODO: Reinstate CoffeeScript tests.
next = -> doctest queue.shift() if queue.length

doctest.complete = (results) ->
  for message, expected of tests
    actual = results.shift()
    if isEqual actual, expected
      console.log "#{green} \u2714 #{gray} #{message}#{reset}"
    else
      console.warn  "#{red} \u2718 #{gray} #{message}#{reset}"
      console.log  "#{gray}      expected: #{green}#{expected}#{reset}"
      console.log  "#{gray}      received: #{red}#{actual}#{reset}"
  next()
next()
