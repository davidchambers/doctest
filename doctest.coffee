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

window.doctest = (urls...) ->
  fetch url for url in urls
  return

fetch = (url) ->
  # Support relative paths; e.g. `doctest("./foo.js")`.
  if /^[.]/.test(url) and ($script = jQuery 'script[src$="doctest.js"]').length
    url = $script.attr('src').replace(/doctest[.]js$/, url)

  console.log "retrieving #{url}..."
  jQuery.get url, (text) ->
    results = test text
    console.log "running doctests in #{url}..."
    console.log ((if pass then '.' else 'x') for [pass] in results).join ''
    for [pass, expected, actual, num] in (r for r in results when not r[0])
      console.warn "expected #{expected} on line #{num} (got #{actual})"

window.doctest.version = '0.1.2'

commented_lines = (text) ->
  lines = []
  for line, idx in text.split /\r?\n|\r/
    if match = /^[ \t]*\/\/[ \t]*(.+)/.exec line
      lines.push [idx + 1, match[1]]
  lines

test = (text) ->
  results = []; expr = ''
  for [num, line] in commented_lines text
    if match = /^>(.*)/.exec line
      eval expr
      expr = match[1]
    else if match = /^[.](.*)/.exec line
      expr += '\n' + match[1]
    else if expr
      expected = eval line
      results.push try
        actual = eval expr
        [_.isEqual(actual, expected), q(expected), q(actual), num]
      catch error
        actual = error.constructor
        [actual is expected, expected?.name or q(expected), error.name, num]
      expr = ''
  results

q = (object) ->
  if typeof object is 'string' then "\"#{object}\"" else object
