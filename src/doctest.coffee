###
          >>>
          >>>                        >>>                         >>>
     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
    .....................x.......xx.x.................................

###

doctest = (path, options = {}, callback = noop) ->
  validateOption = (name, validValues) ->
    if name of options and not R.contains options[name], validValues
      throw new Error "Invalid #{name} `#{options[name]}'"

  validateOption 'module', ['amd', 'commonjs']
  validateOption 'type', ['coffee', 'js']

  type = options.type ? do ->
    match = R.match /[.](coffee|js)$/, path
    if match is null
      throw new Error 'Cannot infer type from extension'
    match[1]

  fetch path, options, (text) ->
    source = toModule rewrite(text, type), options.module

    if options.print
      console.log R.replace(/\n$/, '', source) unless options.silent
      callback source
      source
    else
      results = if options.module is 'commonjs'
        commonjsEval source, path
      else
        functionEval source
      log results unless options.silent
      callback results
      results

doctest.version = '0.7.1'


if typeof window isnt 'undefined'
  {_, CoffeeScript, esprima, R} = window
  window.doctest = doctest
else
  fs = require 'fs'
  pathlib = require 'path'
  _ = require 'underscore'
  CoffeeScript = require 'coffee-script'
  esprima = require 'esprima'
  R = require 'ramda'
  module.exports = doctest


# indentN :: Number -> String -> String
indentN = R.pipe(
  R.times R.always ' '
  R.join ''
  R.replace /^(?!$)/gm
)

# indent2 :: String -> String
indent2 = indentN 2


# noop :: * -> ()
noop = ->


# reduce :: a -> (a,b -> a) -> [b] -> a
reduce = R.flip R.reduce


# toPairs :: [a] -> [(Number,a)]
toPairs = R.converge(
  R.zip
  R.pipe R.length, R.range 0
  R.identity
)


fetch = (path, options, callback) ->
  silent = options.silent or options.print

  wrapper = (text) ->
    name = R.last R.split '/', path
    console.log "running doctests in #{name}..." unless silent
    callback text

  console.log "retrieving #{path}..." unless silent
  if typeof window isnt 'undefined'
    jQuery.ajax path, dataType: 'text', success: wrapper
  else
    wrapper fs.readFileSync path, 'utf8'


rewrite = (input, type) ->
  rewrite[type] input.replace(/\r\n?/g, '\n').replace(/^#!.*/, '')


# toModule :: String,String? -> String
toModule = (source, moduleType) -> switch moduleType
  when 'amd'
    """
    #{source}
    function define() {
      for (var idx = 0; idx < arguments.length; idx += 1) {
        if (typeof arguments[idx] == 'function') {
          arguments[idx]();
          break;
        }
      }
    }

    """
  when 'commonjs'
    iifeWrap = (s) -> "void function() {\n#{indent2 s}}.call(this);"
    iifeWrap """
    var __doctest = {
      queue: [],
      input: function(fn) {
        __doctest.queue.push([fn]);
      },
      output: function(num, fn) {
        __doctest.queue.push([fn, num]);
      }
    };

    #{iifeWrap source}

    (module.exports || exports).__doctest = __doctest;

    """
  else
    source


# transformComments :: [Object] -> [Object]
#
# Returns a list of {input,output} pairs representing the doctests
# present in the given list of esprima comment objects.
#
# > transformComments [
# .   type: 'Line'
# .   value: ' > 6 * 7'
# .   loc: start: {line: 1, column: 0}, end: {line: 1, column: 10}
# . ,
# .   type: 'Line'
# .   value: ' 42'
# .   loc: start: {line: 2, column: 0}, end: {line: 2, column: 5}
# . ]
# [
# . commentIndex: 1
# . input:
# .   value: '6 * 7'
# .   loc: start: {line: 1, column: 0}, end: {line: 1, column: 10}
# . output:
# .   value: '42'
# .   loc: start: {line: 2, column: 0}, end: {line: 2, column: 5}
# . ]
transformComments = R.pipe(
  toPairs
  reduce ['default', []], ([state, accum], [commentIndex, comment]) -> R.pipe(
    R.prop 'value'
    R.split '\n'
    toPairs
    reduce [state, accum], ([state, accum], [idx, line]) ->
      switch comment.type
        when 'Block'
          normalizedLine = R.replace /^\s*[*]?\s*/, '', line
          start = end = line: comment.loc.start.line + idx
        when 'Line'
          normalizedLine = R.replace /^\s*/, '', line
          {start, end} = comment.loc

      [prefix, value] = R.tail R.match /^(>|[.]*)[ ]?(.*)$/, normalizedLine
      if prefix is '>'
        ['input', R.appendTo accum, {
          commentIndex
          input: {loc: {start, end}, value}
        }]
      else if state is 'default'
        ['default', accum]
      else if state is 'input'
        if prefix
          ['input', R.appendTo R.init(accum), {
            commentIndex
            input:
              loc: {start: R.last(accum).input.loc.start, end}
              value: "#{R.last(accum).input.value}\n#{value}"
          }]
        else
          ['output', R.appendTo R.init(accum), {
            commentIndex
            input: R.last(accum).input
            output: {loc: {start, end}, value}
          }]
      else if state is 'output'
        if prefix
          ['output', R.appendTo R.init(accum), {
            commentIndex
            input: R.last(accum).input
            output:
              loc: {start: R.last(accum).output.loc.start, end}
              value: "#{R.last(accum).output.value}\n#{value}"
          }]
        else
          ['default', accum]
  ) comment
  R.last
)


# substring :: String,{line,column},{line,column} -> String
#
# Returns the substring between the start and end positions.
# Positions are specified in terms of line and column rather than index.
# {line: 1, column: 0} represents the first character of the first line.
#
# > substring "hello\nworld", {line: 1, column: 3}, {line: 2, column: 2}
# "lo\nwo"
# > substring "hello\nworld", {line: 1, column: 0}, {line: 1, column: 0}
# ""
substring = (input, start, end) ->
  return '' if start.line is end.line and start.column is end.column
  R.pipe(
    R.split /^/m
    toPairs
    reduce ['', no], (accum, [idx, line]) ->
      isStartLine = idx + 1 is start.line
      isEndLine   = idx + 1 is end.line
      R.pipe(
        R.split ''
        toPairs
        reduce ['', R.last accum], ([chrs, inComment], [column, chr]) ->
          if (isStartLine and column is start.column) or
             inComment and not (isEndLine and column is end.column)
            [R.concat(chrs, chr), yes]
          else
            [chrs, no]
        R.converge(
          R.prepend
          R.pipe R.head, R.concat R.head accum
          R.tail
        )
      ) line
    R.head
  ) input


wrap = R.curry (type, test) -> R.pipe(
  R.filter R.partialRight R.has, test
  R.map (dir) -> wrap[type][dir] test
  R.join '\n'
) ['input', 'output']

wrap.js = wrap 'js'

wrap.js.input = (test) -> """
  __doctest.input(function() {
    return #{test.input.value};
  });
"""

wrap.js.output = (test) ->  """
  __doctest.output(#{test.output.loc.start.line}, function() {
    return #{test.output.value};
  });
"""

wrap.coffee = wrap 'coffee'

wrap.coffee.input = (test) -> """
  __doctest.input ->
  #{indent2 test.input.value}
"""

wrap.coffee.output = (test) -> """
  __doctest.output #{test.output.loc.start.line}, ->
  #{indent2 test.output.value}
"""


rewrite.js = (input) ->
  #  1. Locate block comments and line comments within the input text.
  #
  #  2. Create a list of comment chunks from the list of line comments
  #     located in step 1 by grouping related comments.
  #
  #  3. Create a list of code chunks from the remaining input text.
  #     Note that if there are N comment chunks there are N + 1 code
  #     chunks. A trailing empty comment enables the final code chunk
  #     to be captured:

  bookend = value: '', loc: start: line: Infinity, column: Infinity

  #  4. Map each comment chunk in the list produced by step 2 to a
  #     string of JavaScript code derived from the chunk's doctests.
  #
  #  5. Zip the lists produced by steps 3 and 4; flatten; and join.
  #
  #  6. Find block comments in the source code produced by step 5.
  #     (The locations of block comments located in step 1 are not
  #     applicable to the rewritten source.)
  #
  #  7. Repeat steps 3 through 5 for the list of block comments
  #     produced by step 6 (substituting "step 6" for "step 2").

  getComments = R.pipe(
    R.partialRight esprima.parse, comment: yes, loc: yes
    R.prop 'comments'
  )
  [blockTests, lineTests] = R.pipe(
    getComments
    R.partition R.propEq 'type', 'Block'
    R.map transformComments
  ) input

  source = R.pipe(
    R.append input: bookend
    reduce [[], {line: 1, column: 0}], ([chunks, start], test) -> [
      R.appendTo chunks, substring input, start, test.input.loc.start
      (test.output ? test.input).loc.end
    ]
    R.head
    R.partialRight R.zip, R.append '', R.map wrap.js, lineTests
    R.flatten
    R.join ''
  ) lineTests

  R.pipe(
    getComments
    R.filter R.propEq 'type', 'Block'
    R.append bookend
    toPairs
    reduce [[], {line: 1, column: 0}], ([chunks, start], [idx, comment]) ->
      R.pipe(
        R.filter R.propEq 'commentIndex', idx
        R.map wrap.js
        R.join '\n'
        R.appendTo R.append substring(source, start, comment.loc.start), chunks
        R.of
        R.append comment.loc.end
      ) blockTests
    R.head
    R.join ''
  ) source


rewrite.coffee = (input) ->
  [literalChunks, commentChunks] = R.pipe(
    R.match /.*\n/g
    toPairs
    R.reduce ([literalChunks, commentChunks, inCommentChunk], [idx, line]) ->
      isComment = /^[ \t]*#(?!##)/.test line
      current = if isComment then commentChunks else literalChunks
      if isComment is inCommentChunk
        current[current.length - 1].value += line
      else
        current[current.length] = value: line, loc: start: line: idx + 1
      [literalChunks, commentChunks, isComment]
    , [[value: '', loc: start: line: 1], [], no]
  ) input

  matchLine = R.match /^([ \t]*)#[ \t]*(>|[.]*)(.*\n)/
  testChunks = R.map R.pipe(
    (commentChunk) -> R.pipe(
      R.prop 'value'
      R.match /.*\n/g
      toPairs
      reduce ['default', []], ([state, tests], [idx, line]) ->
        [indent, prefix, value] = R.tail matchLine line
        if prefix is '>'
          tests[tests.length] = {indent, input: {value}}
          ['input', tests]
        else if prefix
          tests[tests.length - 1][state].value += value
          [state, tests]
        else if state is 'input'
          loc = start: line: commentChunk.loc.start.line + idx
          tests[tests.length - 1].output = {loc, value}
          ['output', tests]
        else
          ['default', tests]
    ) commentChunk
    R.last
    R.map R.converge(
      R.apply
      R.pipe R.prop('indent'), R.length, indentN
      R.pipe wrap.coffee, R.of
    )
    R.join '\n'
  ), commentChunks

  R.pipe(
    R.zip
    R.flatten
    R.join '\n'
    CoffeeScript.compile
  ) R.pluck('value', literalChunks), R.append('', testChunks)


functionEval = (source) ->
  # Functions created via the Function function are always run in the
  # global context, which ensures that doctests can't access variables
  # in _this_ context.
  #
  # The `evaluate` function takes one argument, named `__doctest`.
  evaluate = Function '__doctest', source
  queue = []
  evaluate
    input: (fn) -> queue.push [fn]
    output: (num, fn) -> queue.push [fn, num]
  run queue


commonjsEval = (source, path) ->
  abspath = pathlib.resolve(path).replace(/[.][^.]+$/, "-#{_.now()}.js")
  fs.writeFileSync abspath, source
  try
    {queue} = require(abspath).__doctest
  finally
    fs.unlinkSync abspath
  run queue


run = (queue) ->
  results = []; input = noop
  for arr in queue
    switch arr.length
      when 1
        input()
        input = arr[0]
      when 2
        actual = try input() catch error then error.constructor
        expected = arr[0]()
        results.push [
          _.isEqual actual, expected
          repr expected
          repr actual
          arr[1]
        ]
        input = noop
  results


log = (results) ->
  console.log R.join '', ((if pass then '.' else 'x') for [pass] in results)
  for [pass, expected, actual, num] in results when not pass
    console.log "FAIL: expected #{expected} on line #{num} (got #{actual})"
  return


# > repr 'foo \\ bar \\ baz'
# '"foo \\\\ bar \\\\ baz"'
# > repr 'foo "bar" baz'
# '"foo \\"bar\\" baz"'
# > repr TypeError
# 'TypeError'
# > repr 42
# 42
repr = (val) -> switch Object::toString.call val
  when '[object String]'
    '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  when '[object Function]'
    val.name
  else
    val
