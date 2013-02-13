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
      source = CoffeeScript.compile source if type is 'coffee'
      name += "-#{+new Date}"
      file = "#{__dirname}/#{name}.js"
      fs.writeFileSync file, source, 'utf8'
      require "./#{name}"
      fs.unlink file
      doctest.run()


rewrite = (input, type) ->
  input = input.replace /\r\n?/g, '\n'
  f = (indent, expr) ->
    switch type
      when 'coffee' then "->\n#{indent}  #{expr}\n#{indent}"
      when 'js' then "function() {\n#{indent}  return #{expr}\n#{indent}}"

  expr = ''
  processComment = ({value}, start) ->
    lines = []
    for line in value.split('\n')
      [match, indent, comment] = /^([ \t]*)(.*)/.exec line
      continue unless comment
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
    lines = [null, input.split('\n')...]
    idx = start.line
    line = lines[idx]
    if end.line is start.line
      lines[idx] = line.substr(0, start.column) + line.substr(end.column)
    else
      lines[idx] = line.substr(0, start.column)
      while idx += 1
        if idx is end.line
          lines[idx] = lines[idx].substr(end.column)
          break
        lines[idx] = ''
    line = lines[start.line]
    lines[start.line] = line.substr(0, start.column) +
                        processComment(comment, loc.start) +
                        line.substr(start.column)
    input = lines[1..].join('\n')

  if typeof window isnt 'undefined'
    "window.__doctest = doctest;\n#{input}"
  else if type is 'coffee'
    "__doctest = require '../lib/doctest'\n#{input}"
  else if type is 'js'
    "var __doctest = require('../lib/doctest');\n#{input}"


q = (object) ->
  switch typeof object
    when 'string' then return "\"#{object}\""
    when 'function'
      try throw object()
      catch error then return object.name if error instanceof Error
  object
