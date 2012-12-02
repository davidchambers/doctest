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

doctest.version = '0.3.0'

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


fetch = (url) ->
  # Support relative paths; e.g. `doctest("./foo.js")`.
  if /^[.]/.test(url) and ($script = jQuery 'script[src$="doctest.js"]').length
    url = $script.attr('src').replace(/doctest[.]js$/, url)

  console.log "retrieving #{url}..."
  jQuery.ajax url, dataType: 'text', success: doctest.generate_fetch_callback url

doctest.generate_fetch_callback = (url) ->
  (text) ->
    [name, type] = /[^/]+[.](coffee|js)$/.exec url
    console.log "running doctests in #{name}..."
    source = rewrite text, type
    source = CoffeeScript.compile source if type is 'coffee'
    # Functions created via `Function` are always run in the `window`
    # context, which ensures that doctests can't access variables in
    # _this_ context. A doctest which assigns to or references `text`
    # sets/gets `window.text`, not this function's `text` parameter.
    if typeof window isnt 'undefined' then do Function source else eval source
    doctest.run()


rewrite = (text, type) ->
  f = (expr) ->
    switch type
      when 'coffee' then "->\n#{indent}  #{expr}\n#{indent}"
      when 'js' then "function() {\n#{indent}  return #{expr}\n#{indent}}"

  comments =
    coffee: /^([ \t]*)#[ \t]*(.+)/
    js: /^([ \t]*)\/\/[ \t]*(.+)/

  lines = []; expr = ''
  if typeof window is 'undefined'
    lines.push switch type
      when 'coffee' then 'doctest = require "./doctest"'
      when 'js' then 'var doctest = require("./doctest");'
  for line, idx in text.split /\r?\n|\r/
    if match = comments[type].exec line
      [match, indent, comment] = match
      if match = /^>(.*)/.exec comment
        lines.push "#{indent}doctest.input(#{f expr});" if expr
        expr = match[1]
      else if match = /^[.](.*)/.exec comment
        expr += "\n#{indent}  #{match[1]}"
      else if expr
        lines.push "#{indent}doctest.input(#{f expr});"
        lines.push "#{indent}doctest.output(#{idx + 1}, #{f comment});"
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
