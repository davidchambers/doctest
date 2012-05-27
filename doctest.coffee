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

doctest.version = '0.2.0'

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

    expected = fn()
    results.push try
      actual = input()
      [_.isEqual(actual, expected), q(expected), q(actual), num]
    catch error
      actual = error.constructor
      [actual is expected, expected?.name or q(expected), error.name, num]
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
  lines = []; expr = ''
  for line, idx in text.split /\r?\n|\r/
    if match = /^[ \t]*\/\/[ \t]*(.+)/.exec line
      comment = match[1]
      if match = /^>(.*)/.exec comment
        lines.push "doctest.input(function(){return #{expr}})" if expr
        expr = match[1]
      else if match = /^[.](.*)/.exec comment
        expr += '\n' + match[1]
      else if expr
        lines.push "doctest.input(function(){return #{expr}})"
        lines.push "doctest.output(#{idx + 1},function(){return #{comment}})"
        expr = ''
    else
      lines.push line
  lines.join '\n'


q = (object) ->
  if typeof object is 'string' then "\"#{object}\"" else object


window.doctest = doctest
