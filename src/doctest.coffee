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
    if R.isEmpty match
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


if typeof window isnt 'undefined'
  {CoffeeScript, esprima, R} = window
  _ = R.__
  window.doctest = doctest
else
  fs = require 'fs'
  pathlib = require 'path'
  CoffeeScript = require 'coffee-script'
  esprima = require 'esprima-fb'
  R = require 'ramda'
  _ = R.__
  module.exports = doctest


# appendTo :: [a] -> a -> [a]
appendTo = R.flip R.append


# (b -> c) -> (a -> b) -> (a -> c)
compose = R.curryN 2, R.compose


# fromMaybe :: a -> [a] -> a
fromMaybe = R.curry (x, maybe) -> if R.isEmpty maybe then x else maybe[0]


# indentN :: Number -> String -> String
indentN = R.curry (n, s) -> R.replace /^(?!$)/gm, Array(n + 1).join(' '), s


# joinLines :: [String] -> String
joinLines = R.join '\n'


# noop :: * -> ()
noop = ->


# quote :: String -> String
quote = (s) -> "'#{R.replace /'/g, "\\'", s}'"


# reduce :: a -> (a,b,Number,[b] -> a) -> [b] -> a
reduce = R.flip R.addIndex R.reduce


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
    iifeWrap = (s) -> "void function() {\n#{indentN 2, s}}.call(this);"
    iifeWrap """
    var __doctest = {
      queue: [],
      enqueue: function(io) { this.queue.push(io); }
    };

    #{iifeWrap source}

    (module.exports || exports).__doctest = __doctest;

    """
  else
    source


# normalizeTest :: { output :: { value :: String } } ->
#                    { ! :: Boolean, output :: { value :: String } }
normalizeTest = R.converge(
  R.call
  R.pipe(R.of
         R.filter R.has 'output'
         R.map R.prop 'output'
         R.map R.prop 'value'
         R.map R.match /^![ ]?([^:]*)(?::[ ]?(.*))?$/
         R.map R.ifElse(R.isEmpty
                        R.always R.assoc '!', no
                        R.converge(R.pipe(((t, m) -> "new #{t}(#{m})")
                                          R.assocPath ['output', 'value']
                                          compose R.assoc '!', yes)
                                   R.nth 1
                                   R.pipe(R.nth 2
                                          R.of
                                          R.reject R.isNil
                                          R.map quote
                                          fromMaybe '')))
         fromMaybe R.identity)
  R.identity
)


_commentIndex           = R.lensProp 'commentIndex'
_end                    = R.lensProp 'end'
_input                  = R.lensProp 'input'
_loc                    = R.lensProp 'loc'
_output                 = R.lensProp 'output'
_value                  = R.lensProp 'value'
_1                      = R.lensIndex 0
_2                      = R.lensIndex 1
_2._last                = R.compose _2, R.lens R.last, (x, xs) -> R.update xs.length - 1, x, xs
_2._last.commentIndex   = R.compose _2._last, _commentIndex
_2._last.output         = R.compose _2._last, _output
_2._last.output.loc     = R.compose _2._last.output, _loc
_2._last.output.loc.end = R.compose _2._last.output.loc, _end
_2._last.output.value   = R.compose _2._last.output, _value
_2._last.input          = R.compose _2._last, _input
_2._last.input.loc      = R.compose _2._last.input, _loc
_2._last.input.loc.end  = R.compose _2._last.input.loc, _end
_2._last.input.value    = R.compose _2._last.input, _value


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
# [ {
# . commentIndex: 1
# . '!': no
# . input:
# .   value: '6 * 7'
# .   loc: start: {line: 1, column: 0}, end: {line: 1, column: 10}
# . output:
# .   value: '42'
# .   loc: start: {line: 2, column: 0}, end: {line: 2, column: 5}
# . } ]
transformComments = R.pipe(
  reduce ['default', []], (accum, comment, commentIndex) -> R.pipe(
    R.prop 'value'
    R.split '\n'
    reduce accum, (accum, line, idx) ->
      [state] = accum
      switch comment.type
        when 'Block'
          normalizedLine = R.replace /^\s*[*]?\s*/, '', line
          start = end = line: comment.loc.start.line + idx
        when 'Line'
          normalizedLine = R.replace /^\s*/, '', line
          {start, end} = comment.loc

      [prefix, value] = R.tail R.match /^(>|[.]*)[ ]?(.*)$/, normalizedLine
      fn = if prefix is '>'
        R.pipe(R.set _1, 'input'
               R.over _2, R.append {}
               R.set _2._last.commentIndex, commentIndex
               R.set _2._last.input, {loc: {start, end}, value})
      else if prefix
        R.pipe(R.set _2._last.commentIndex, commentIndex
               R.set _2._last[state].loc.end, end
               R.over _2._last[state].value, R.concat _, "\n#{value}")
      else if state is 'input'
        R.pipe(R.set _1, 'output'
               R.set _2._last.commentIndex, commentIndex
               R.set _2._last.output, {loc: {start, end}, value})
      else
        R.set _1, 'default'
      fn accum
  ) comment
  R.last
  R.map normalizeTest
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
    reduce ['', no], (accum, line, idx) ->
      isStartLine = idx + 1 is start.line
      isEndLine   = idx + 1 is end.line
      R.pipe(
        R.split ''
        reduce ['', R.last accum], ([chrs, inComment], chr, column) ->
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
  R.filter R.has _, test
  R.map (dir) -> wrap[type][dir] test
  joinLines
) ['input', 'output']

wrap.js = wrap 'js'

wrap.js.input = (test) -> """
  __doctest.enqueue({
    type: 'input',
    thunk: function() {
      return #{test.input.value};
    }
  });
"""

wrap.js.output = (test) -> """
  __doctest.enqueue({
    type: 'output',
    ':': #{test.output.loc.start.line},
    '!': #{test['!']},
    thunk: function() {
      return #{test.output.value};
    }
  });
"""

wrap.coffee = wrap 'coffee'

wrap.coffee.input = (test) -> """
  __doctest.enqueue {
    type: 'input'
    thunk: ->
  #{indentN 4, test.input.value}
  }
"""

wrap.coffee.output = (test) -> """
  __doctest.enqueue {
    type: 'output'
    ':': #{test.output.loc.start.line}
    '!': #{test['!']}
    thunk: ->
  #{indentN 4, test.output.value}
  }
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
      appendTo chunks, substring input, start, test.input.loc.start
      (test.output ? test.input).loc.end
    ]
    R.head
    R.zip _, R.append '', R.map wrap.js, lineTests
    R.flatten
    R.join ''
  ) lineTests

  R.pipe(
    getComments
    R.filter R.propEq 'type', 'Block'
    R.append bookend
    reduce [[], {line: 1, column: 0}], ([chunks, start], comment, idx) ->
      R.pipe(
        R.filter R.propEq 'commentIndex', idx
        R.map wrap.js
        joinLines
        appendTo R.append substring(source, start, comment.loc.start), chunks
        R.of
        R.append comment.loc.end
      ) blockTests
    R.head
    R.join ''
  ) source


rewrite.coffee = (input) ->
  [literalChunks, commentChunks] = R.pipe(
    R.match /^.*(?=\n)/gm
    R.addIndex(R.reduce) \
    ([literalChunks, commentChunks, inCommentChunk], line, idx) ->
      isComment = R.test /^[ \t]*#(?!##)/, line
      current = if isComment then commentChunks else literalChunks
      if isComment is inCommentChunk
        current[current.length - 1].lines.push line
      else
        current[current.length] = lines: [line], loc: start: line: idx + 1
      [literalChunks, commentChunks, isComment]
    , [[lines: [], loc: start: line: 1], [], no]
  ) input

  matchLine = R.match /^([ \t]*)#[ \t]*(>|[.]*)[ ]?(.*)$/
  testChunks = R.map R.pipe(
    (commentChunk) -> R.pipe(
      R.prop 'lines'
      reduce ['default', []], ([state, tests], line, idx) ->
        [indent, prefix, value] = R.tail matchLine line
        if prefix is '>'
          tests[tests.length] = {indent, input: {value}}
          ['input', tests]
        else if prefix
          tests[tests.length - 1][state].value += "\n#{value}"
          [state, tests]
        else if state is 'input'
          loc = start: line: commentChunk.loc.start.line + idx
          tests[tests.length - 1].output = {loc, value}
          ['output', tests]
        else
          ['default', tests]
    ) commentChunk
    R.last
    R.map normalizeTest
    R.map R.converge indentN, R.path(['indent', 'length']), wrap.coffee
    joinLines
  ), commentChunks

  CoffeeScript.compile joinLines R.flatten R.zip(
    R.map R.compose(joinLines, R.prop 'lines'), literalChunks
    R.append '', testChunks
  )


functionEval = (source) ->
  # Functions created via the Function function are always run in the
  # global context, which ensures that doctests can't access variables
  # in _this_ context.
  #
  # The `evaluate` function takes one argument, named `__doctest`.
  evaluate = Function '__doctest', source
  queue = []
  evaluate enqueue: (io) -> queue.push io
  run queue


commonjsEval = (source, path) ->
  abspath = pathlib.resolve(path).replace(/[.][^.]+$/, "-#{Date.now()}.js")
  fs.writeFileSync abspath, source
  try
    {queue} = require(abspath).__doctest
  finally
    fs.unlinkSync abspath
  run queue


run = (queue) ->
  results = []
  thunks = []  # thunks :: Maybe (() -> *)
  for io in queue
    if io.type is 'input'
      R.forEach R.call, thunks
      thunks = [io.thunk]
    else if io.type is 'output'
      throws = no
      actual = try
        R.head R.map R.call, thunks
      catch error
        throws = yes
        error
      expected = io.thunk()

      format = (err) ->
        if expected.message and err.message
          "! #{err.name}: #{err.message}"
        else
          "! #{err.name}"

      results.push [
        throws is io['!'] and
        if R.is Error, actual
          actual.constructor is expected.constructor and
          (throws and not expected.message or
           actual.message is expected.message)
        else
          R.equals actual, expected
        (if throws then format else R.toString) actual
        (if io['!'] then format else R.toString) expected
        io[':']
      ]
      thunks = []
  results


log = (results) ->
  console.log R.join '', ((if pass then '.' else 'x') for [pass] in results)
  for [pass, actual, expected, num] in results when not pass
    console.log "FAIL: expected #{expected} on line #{num} (got #{actual})"
  return
