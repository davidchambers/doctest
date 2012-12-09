tests =

'global variable accessible in outer scope':
  [yes, '"global"', '"global"', 3]

'global variable accessible in inner scope':
  [yes, '"global"', '"global"', 10]

'local variable referenced, not shadowed global':
  [yes, '"shadowed"', '"shadowed"', 14]

'local variable accessible before declaration':
  [yes, 2, 2, 20]

'assignment is an expression':
  [yes, 3, 3, 25]

'variable declared in doctest remains accessible':
  [yes, [1, 2, 3], [1, 2, 3], 28]

'arithmetic error reported':
  [no, 5, 4, 31]

'TypeError captured and reported':
  [yes, 'TypeError', 'TypeError', 35]

'TypeError expected but not reported':
  [no, 'TypeError', 0, 38]

'function accessible before declaration':
  [yes, 12, 12, 42]

'NaN can be used as expected result':
  [yes, NaN, NaN, 45]

'function accessible after declaration':
  [yes, 4, 4, 53]

'multiline input':
  [yes, [1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9], 65]

'multiline assignment':
  [yes, '"input may span many lines"', '"input may span many lines"', 71]

'spaces following "//" and ">" are optional':
  [yes, '"no spaces"', '"no spaces"', 75]

'indented doctest':
  [yes, '"Docco-compatible whitespace"', '"Docco-compatible whitespace"', 78]

'">" in doctest':
  [yes, yes, yes, 81]

'comment on input line':
  [yes, '"foobar"', '"foobar"', 85]

'comment on output line':
  [yes, 25, 25, 88]

'variable in creation context is not accessible':
  [yes, '"undefined"', '"undefined"', 92]

'"." should not follow leading "." in multiline expressions':
  [no, 9.5, 5, 97]


if typeof window isnt 'undefined'
  window.tests = tests
else
  module.exports = tests
