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
  {_, CoffeeScript} = window
  window.doctest = doctest
else
  _ = require 'underscore'
  CoffeeScript = require 'coffee-script'
  module.exports = doctest

# > doctest.version
# '0.4.1'
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
      rewriter = new Rewriter(type)
      source = rewriter.rewrite text
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
      rewriter = new Rewriter(type)
      source = rewriter.rewrite text
      source = CoffeeScript.compile source if type is 'coffee'
      name += "-#{+new Date}"
      file = "#{__dirname}/#{name}.js"
      fs.writeFileSync file, source, 'utf8'
      require "./#{name}"
      fs.unlink file
      doctest.run()

r = {}
# > r = new Rewriter 'coffee'; ''
# ''
# > r.in_block
# false
# > r.rewrite '###'
# '__doctest = require "./doctest"\n###'
# > r.in_block
# true
# > r = new Rewriter 'coffee'; ''
# ''
# > r.rewrite '###\n###'
# '__doctest = require "./doctest"\n###\n###'
# > r.in_block
# false
class Rewriter
  constructor: (@type) ->
    comments =
      coffee: /^([ \t]*)#[ \t]*(.+)/
      js: /^([ \t]*)\/\/[ \t]*(.+)/
    @inline = comments[@type]
    @in_block = false

  block: (line) ->
    if @type is 'coffee'
      if not @in_block and /^ *\#\#\# *$/.test(line)
        @in_block = true
      else if @in_block and /^ *\#\#\# *$/.test(line)
        @in_block = false # next lines are no more in a block
        true # but this line is
      else
        @in_block
    else if @type is 'js'
      if not @in_block and /\/\*/.test(line) and not /\*\//.test(line)
        @in_block = true
      else if @in_block and /\*\//.test(line) and not /\/\*/.test(line)
        @in_block = false # next lines are no more in a block
        true # but this line is
      else
        @in_block

  rewrite: (text) ->
    lines = []; expr = ''
    if typeof window is 'undefined'
      lines.push switch @type
        when 'coffee' then '__doctest = require "./doctest"'
        when 'js' then 'var __doctest = require("./doctest");'
    for line, idx in text.split /\r?\n|\r/
      if not @block(line) and match = @inline.exec line
        [match, indent, comment] = match
        @f = (expr) ->
          switch @type
            when 'coffee' then "->\n#{indent}  #{expr}\n#{indent}"
            when 'js' then "function() {\n#{indent}  return #{expr}\n#{indent}}"
        if match = /^>(.*)/.exec comment
          lines.push "#{indent}__doctest.input(#{@f expr});" if expr
          expr = match[1]
        else if match = /^[.]+(.*)/.exec comment
          expr += "\n#{indent}  #{match[1]}"
        else if expr
          lines.push "#{indent}__doctest.input(#{@f expr});"
          lines.push "#{indent}__doctest.output(#{idx + 1}, #{@f comment});"
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
