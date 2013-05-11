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

doctest = (urls...) -> _.each urls, fetch

if typeof window isnt 'undefined'
  {_, CoffeeScript, escodegen, esprima} = window
  window.doctest = doctest
else
  _ = require 'underscore'
  CoffeeScript = require 'coffee-script'
  escodegen = require 'escodegen'
  esprima = require 'esprima'
  module.exports = doctest

doctest.version = '0.4.1'

doctest.queue = []

doctest.input = (fn) ->
  @queue.push fn

doctest.output = (num, fn) ->
  fn.line = num
  @queue.push fn

doctest.run = ->
  results = []; input = null

  while fn = @queue.shift()
    unless num = fn.line
      input?()
      input = fn
      continue

    actual = try input() catch error then error.constructor
    expected = fn()
    results.push [_.isEqual(actual, expected), q(expected), q(actual), num]
    input = null

  @complete results

doctest.complete = (results) ->
  console.log ((if pass then '.' else 'x') for [pass] in results).join ''
  for [pass, expected, actual, num] in (r for r in results when not r[0])
    console.warn "expected #{expected} on line #{num} (got #{actual})"


fetch = (path) ->
  console.log "retrieving #{path}..."
  if typeof window isnt 'undefined'
    # Support relative paths; e.g. `doctest("./foo.js")`.
    if path[0] is '.' and (script = jQuery 'script[src$="doctest.js"]').length
      path = script.attr('src').replace(/doctest[.]js$/, path)
    jQuery.ajax path, dataType: 'text', success: (text) ->
      [name, type] = /[^/]+[.](coffee|js)$/.exec path
      console.log "running doctests in #{name}..."
      source = rewrite text, type
      source = CoffeeScript.compile source if type is 'coffee'
      # Functions created via `Function` are always run in the `window`
      # context, which ensures that doctests can't access variables in
      # _this_ context. A doctest which assigns to or references `text`
      # sets/gets `window.text`, not this function's `text` parameter.
      do Function source
      doctest.run()
  else
    fs = require 'fs'
    fs.readFile path, 'utf8', (err, text) ->
      [name, type] = /[^/]+[.](coffee|js)$/.exec path
      console.log "running doctests in #{name}..."
      source = rewrite text, type
      if doctest.dump
        console.log source
        return
      try
        source = CoffeeScript.compile source if type is 'coffee'
      catch e
        console.log 'error', e, 'compiling coffee', source
        return
      name += "-#{+new Date}"
      file = "#{__dirname}/#{name}.js"
      fs.writeFileSync file, source, 'utf8'
      require "./#{name}"
      fs.unlink file
      doctest.run()


rewrite = (input, type) ->
  switch type
    when 'coffee' then rewriteCoffee input
    when 'js' then rewriteJava input

rewriteJava = (input) ->
  input = input.replace /\r\n?/g, '\n'
  f = (indent, expr) ->
      "function() {\n#{indent}  return #{expr}\n#{indent}}"

  processComment = do (expr = '') -> ({value}, start) ->
    lines = []
    for line in value.split('\n')
      [match, indent, comment] = /^([ \t]*)(.*)/.exec line
      if match = /^>(.*)/.exec comment
        lines.push "#{indent}__doctest.input(#{f indent, expr});" if expr
        expr = match[1]
      else if match = /^[.]+(.*)/.exec comment
        expr += "\n#{indent}  #{match[1]}"
      else if expr
        lines.push "#{indent}__doctest.input(#{f indent, expr});"
        lines.push "#{indent}__doctest.output(#{start.line}, #{f indent, line});"
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

  if typeof window isnt 'undefined'
    "window.__doctest = doctest;\n#{input}"
  else
    "var __doctest = require('../lib/doctest');\n#{input}"

rewriteCoffee = (text) ->
  f = (indent, expr) -> "->\n#{indent}  #{expr}\n#{indent}"

  comments = /^([ \t]*)#[ \t]*(.+)/

  lines = []; expr = ''
  if typeof window isnt 'undefined'
    lines.push "window.__doctest = doctest"
  else
    lines.push "__doctest = require '../lib/doctest'"

  for line, idx in text.split /\r?\n|\r/
    if match = comments.exec line
      [match, indent, comment] = match
      if match = /^>(.*)/.exec comment
        lines.push "#{indent}__doctest.input(#{f indent, expr});" if expr
        expr = match[1]
      else if match = /^[.]+(.*)/.exec comment
        expr += "\n#{indent}  #{match[1]}"
      else if expr
        lines.push "#{indent}__doctest.input(#{f indent, expr});"
        lines.push "#{indent}__doctest.output(#{idx + 1}, #{f indent, comment});"
        expr = ''
    else
      lines.push line
  lines.join '\n'

q = (object) ->
  switch typeof object
    when 'string' then return "\"#{object}\""
    when 'function'
      try throw object()
      catch error then return object.name if error instanceof Error
  object
