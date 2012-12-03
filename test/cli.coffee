_ = require 'underscore'
doctest = require '../src/doctest'
tests = require './tests'


queue = ['test/test.js', 'test/test.coffee']
next = -> doctest queue.shift() if queue.length

doctest.complete = (results) ->
  for message, expected of tests
    actual = results.shift()
    if _.isEqual actual, expected
      console.log "\u001b[32m\u2714 #{message}\u001b[0m"
    else
      console.warn """
      \u001b[31m\u2718 #{message}
          expected .. #{expected}
          actual .... #{actual}\u001b[0m"""
  next()
next()
