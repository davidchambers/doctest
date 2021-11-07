

url = if typeof __doctest is 'undefined' then {} else __doctest.require 'url'

# > (new url.URL ('https://sanctuary.js.org/')).hostname
# 'sanctuary.js.org'
