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
    match = /[.](coffee|js)$/.exec path
    if match is null
      throw new Error 'Cannot infer type from extension'
    match[1]

  fetch path, options, (text) ->
    source = toModule rewrite(text, type), options.module

    if options.print
      console.log source.replace(/\n$/, '') unless options.silent
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

doctest.version = '0.6.1'


if typeof window isnt 'undefined'
  {_, CoffeeScript, esprima, ramda: R} = window
  window.doctest = doctest
else
  fs = require 'fs'
  pathlib = require 'path'
  _ = require 'underscore'
  CoffeeScript = require 'coffee-script'
  esprima = require 'esprima'
  R = require 'ramda'
  module.exports = doctest


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
    """
    var __doctest = {
      queue: [],
      input: function(fn) {
        __doctest.queue.push([fn]);
      },
      output: function(num, fn) {
        __doctest.queue.push([fn, num]);
      }
    };

    #{source}
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
# [{commentIndex: 1, input: {value: '6 * 7', loc: {start: {line: 1, column: 0}, end: {line: 1, column: 10}}}, output: {value: '42', loc: {start: {line: 2, column: 0}, end: {line: 2, column: 5}}}}]
transformComments = R.pipe(
  R.reduce.idx ([state, accum], comment, commentIndex) ->
    R.reduce.idx ([state, accum], line, idx) ->
      switch comment.type
        when 'Block'
          normalizedLine = line.replace /^\s*[*]?\s*/, ''
          start = end = line: comment.loc.start.line + idx
        when 'Line'
          normalizedLine = line.replace /^\s*/, ''
          {start, end} = comment.loc

      [..., prefix, value] = /^(>|[.]*)[ ]?(.*)$/.exec normalizedLine
      if prefix is '>'
        [1, accum.concat {
          commentIndex
          input: {loc: {start, end}, value}
        }]
      else if state is 0
        [0, accum]
      else if prefix
        [1, R.concat R.slice(0, -1, accum), [{
          commentIndex
          input:
            loc: {start: R.last(accum).input.loc.start, end}
            value: "#{R.last(accum).input.value}\n#{value}"
        }]]
      else
        [0, R.concat R.slice(0, -1, accum), [{
          commentIndex
          input: R.last(accum).input
          output: {loc: {start, end}, value}
        }]]
    , [state, accum], comment.value.split '\n'
  , [0, []]
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
  combine = (a, b) -> ["#{a[0]}#{b[0]}", b[1]]
  R.pipe(
    R.split /^/m
    R.reduce.idx (accum, line, idx) ->
      isStartLine = idx + 1 is start.line
      isEndLine   = idx + 1 is end.line
      combine accum, R.reduce.idx ([chrs, inComment], chr, column) ->
        if (isStartLine and column is start.column) or
           inComment and not (isEndLine and column is end.column)
          ["#{chrs}#{chr}", yes]
        else
          ["#{chrs}", no]
      , ['', R.last accum], line
    , ['', no]
    R.first
  ) input


rewrite.js = (input) ->
  wrap = (test) ->
    R.pipe(
      R.filter (x) -> Object::hasOwnProperty.call test, x
      R.map (type) -> wrap[type] test
      R.join '\n'
    ) ['input', 'output']

  wrap.input = (test) -> """
    __doctest.input(function() {
      return #{test.input.value};
    });
  """
  wrap.output = (test) -> """
    __doctest.output(#{test.output.loc.start.line}, function() {
      return #{test.output.value};
    });
  """

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
    R.rPartial esprima.parse, comment: yes, loc: yes
    R.prop('comments')
  )
  [blockTests, lineTests] = R.pipe(
    getComments
    R.partition R.pipe R.prop('type'), R.eq('Block')
    R.map transformComments
  ) input

  source = R.pipe(
    R.concat
    R.reduce ([chunks, start], test) ->
      [[chunks..., substring input, start, test.input.loc.start]
       (test.output ? test.input).loc.end]
    , [[], {line: 1, column: 0}]
    R.first
    R.rPartial R.zip, R.concat R.map(wrap, lineTests), [undefined]
    R.flatten
    R.join ''
  ) lineTests, [input: bookend]

  R.pipe(
    getComments
    R.filter R.pipe R.prop('type'), R.eq('Block')
    R.rPartial R.concat, [bookend]
    R.reduce.idx ([chunks, start], comment, idx) ->
      s = R.pipe(
        R.filter R.pipe R.prop('commentIndex'), R.eq(idx)
        R.map wrap
        R.join '\n'
      ) blockTests
      [[chunks..., substring(source, start, comment.loc.start), s],
       comment.loc.end]
    , [[], {line: 1, column: 0}]
    R.first
    R.join ''
  ) source


rewrite.coffee = (input) ->
  wrap =
    input: (test) ->
      "__doctest.input -> #{test.input.value}"
    output: (test) ->
      "__doctest.output #{test.output.loc.start.line}, -> #{test.output.value}"

  R.pipe(
    R.split '\n'
    R.reduce.idx ([expr, lines], line, idx) ->
      if match = /^([ \t]*)#(?!##)[ \t]*(>|[.]*)(.*)$/.exec line
        [..., indent, prefix, value] = match
        if prefix is '>' and expr
          [value, lines.concat "#{indent}#{wrap.input input: value: expr}"]
        else if prefix is '>'
          [value, lines]
        else if prefix
          ["#{expr}\n#{indent}  #{value}", lines]
        else if expr
          ['', lines.concat [
            "#{indent}#{wrap.input input: value: expr}"
            "#{indent}#{wrap.output output: {value, loc: start: line: idx + 1}}"
          ]]
        else
          [expr, lines]
      else
        [expr, lines.concat line]
    , ['', []]
    R.last
    R.join '\n'
    CoffeeScript.compile
  ) input


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
  fs.writeFileSync abspath, """
    var __doctest = {
      queue: [],
      input: function(fn) {
        __doctest.queue.push([fn]);
      },
      output: function(num, fn) {
        __doctest.queue.push([fn, num]);
      }
    };
    #{source}
    (module.exports || exports).__doctest = __doctest;
  """
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


noop = ->


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
