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

doctest.version = '0.2.2'

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
  jQuery.ajax url, dataType: 'text', success: (text) ->
    console.log "running doctests in #{/[^/]+$/.exec url}..."
    eval rewrite text
    doctest.run()


rewrite = (text) ->
  f = (expr) -> "function() {\n  return #{expr}\n}"
  lines = []; expr = ''
  for line, idx in text.split /\r?\n|\r/
    if match = /^[ \t]*\/\/[ \t]*(.+)/.exec line
      comment = match[1]
      if match = /^>(.*)/.exec comment
        lines.push "doctest.input(#{f expr});" if expr
        expr = match[1]
      else if match = /^[.](.*)/.exec comment
        expr += '\n' + match[1]
      else if expr
        lines.push "doctest.input(#{f expr});"
        lines.push "doctest.output(#{idx + 1}, #{f comment});"
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


window.doctest = doctest
