jQuery ($) ->

  callback = (results) ->
    for message, expected of tests
      deepEqual results.shift(), expected, message
    start()

  asyncTest 'JavaScript doctests', ->
    doctest './test.js', callback

  asyncTest 'CoffeeScript doctests', ->
    doctest './test.coffee', callback
