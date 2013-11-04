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

doctest = (path, callback = noop) ->
  fetch path, (text, type) ->
    source = rewrite[type] text
    source += ";\n#{defineFunctionString}" if isModule source
    # Functions created via `Function` are always run in the `window`
    # context, which ensures that doctests can't access variables in
    # _this_ context. A doctest which assigns to or references `text`
    # sets/gets `window.text`, not this function's `text` parameter.
    # The `evaluate` function takes one argument, named `__doctest`.
    evaluate = Function '__doctest', source
    queue = []
    evaluate
      input: (fn) -> queue.push [fn]
      output: (num, fn) -> queue.push [fn, num]
    results = run queue
    log results
    callback results

doctest.version = '0.4.1'


if typeof window isnt 'undefined'
  {_, CoffeeScript, escodegen, esprima} = window
  window.doctest = doctest
else
  _ = require 'underscore'
  CoffeeScript = require 'coffee-script'
  escodegen = require 'escodegen'
  esprima = require 'esprima'
  module.exports = doctest


fetch = (path, callback) ->
  console.log "retrieving #{path}..."
  if typeof window isnt 'undefined'
    # Support relative paths; e.g. `doctest("./foo.js")`.
    if path[0] is '.' and (script = jQuery 'script[src$="doctest.js"]').length
      path = script.attr('src').replace(/doctest[.]js$/, path)
    jQuery.ajax path, dataType: 'text', success: (text) ->
      [name, type] = /[^/]+[.](coffee|js)$/.exec path
      console.log "running doctests in #{name}..."
      callback text, type
  else
    fs = require 'fs'
    fs.readFile path, 'utf8', (err, text) ->
      [name, type] = /[^/]+[.](coffee|js)$/.exec path
      console.log "running doctests in #{name}..."
      callback text, type


rewrite = (input, type) ->
  rewrite[type] input.replace /\r\n?/g, '\n'


rewrite.js = (input) ->
  f = (expr) -> "function() {\n  return #{expr}\n}"

  processComment = do (expr = '') -> ({value}, start) ->
    lines = []
    for line in value.split('\n')
      [match, indent, comment] = /^([ \t]*)(.*)/.exec line
      if match = /^>(.*)/.exec comment
        lines.push "__doctest.input(#{f expr})" if expr
        expr = match[1]
      else if match = /^[.]+(.*)/.exec comment
        expr += "\n#{match[1]}"
      else if expr
        lines.push "__doctest.input(#{f expr})"
        lines.push "__doctest.output(#{start.line}, #{f line})"
        expr = ''
    escodegen.generate esprima.parse(lines.join('\n')), indent: '  '

  for {loc} in esprima.parse(input, comment: yes, loc: yes).comments
    [comment] = esprima.parse(input, comment: yes, loc: yes).comments
    {start, end} = comment.loc
    lines = input.split('\n')
    idx = start.line - 1
    line = lines[idx]
    if end.line is start.line
      lines[idx] = line.substr(0, start.column) + line.substr(end.column)
    else
      lines[idx] = line.substr(0, start.column)
      lines[idx] = '' until ++idx is end.line - 1
      lines[idx] = lines[idx].substr(end.column)
    line = lines[start.line - 1]
    lines[start.line - 1] = line.substr(0, start.column) +
                            processComment(comment, loc.start) +
                            line.substr(start.column)
    input = lines.join('\n')
  input


rewrite.coffee = (input) ->
  f = (indent, expr) -> "->\n#{indent}  #{expr}\n#{indent}"

  lines = []; expr = ''
  for line, idx in input.split('\n')
    if match = /^([ \t]*)#[ \t]*(.+)/.exec line
      [match, indent, comment] = match
      if match = /^>(.*)/.exec comment
        lines.push "#{indent}__doctest.input #{f indent, expr}" if expr
        expr = match[1]
      else if match = /^[.]+(.*)/.exec comment
        expr += "\n#{indent}  #{match[1]}"
      else if expr
        lines.push "#{indent}__doctest.input #{f indent, expr}"
        lines.push "#{indent}__doctest.output #{idx + 1}, #{f indent, comment}"
        expr = ''
    else
      lines.push line
  CoffeeScript.compile lines.join('\n')


defineFunctionString = '''
  function define() {
    var arg, idx;
    for (idx = 0; idx < arguments.length; idx += 1) {
      arg = arguments[idx];
      if (typeof arg === 'function') {
        arg();
        break;
      }
    }
  }
'''


isModule = (source) ->
  _.some esprima.parse(source).body, (node) ->
    node.type is 'ExpressionStatement' and
    node.expression.type is 'CallExpression' and
    node.expression.callee.type is 'Identifier' and
    node.expression.callee.name is 'define'


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
  console.log ((if pass then '.' else 'x') for [pass] in results).join('')
  for [pass, expected, actual, num] in results when not pass
    console.warn "expected #{expected} on line #{num} (got #{actual})"
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
