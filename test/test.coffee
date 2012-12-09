1: 'global variable accessible in outer scope'
# > global
# "global"
global = 'global'

do ->

  2: 'global variable accessible in inner scope'
  # > global
  # "global"
  do (global = 'shadowed') ->
    3: 'local variable referenced, not shadowed global'
    # > global
    # "shadowed"



  4: 'local variable accessible before declaration'
  # > one * two
  # 2
  one = 1
  two = 2
  5: 'assignment is an expression'
  # > @three = one + two
  # 3
  6: 'variable declared in doctest remains accessible'
  # > [one, two, three]
  # [1, 2, 3]
  7: 'arithmetic error reported'
  # > two + two
  # 5

  8: 'TypeError captured and reported'
  # > null.length
  # TypeError
  9: 'TypeError expected but not reported'
  # > [].length
  # TypeError

  10: 'function accessible before declaration'
  # > double(6)
  # 12
  11: 'NaN can be used as expected result'
  # > double()
  # NaN
  double = (n) ->
    # doctests should only be included in contexts where they'll be
    # invoked immediately (i.e. at the top level or within an IIFE)
    2 * n

  12: 'function accessible after declaration'
  # > double.call(null, 2)
  # 4

  triple = (n) ->
    # > this.doctest.should.never.be.executed
    # ( blow.up.if.for.some.reason.it.is )
    3 * n


  13: 'multiline input'
  # > [1,2,3,
  # .  4,5,6,
  # .  7,8,9]
  # [1,2,3,4,5,6,7,8,9]
  14: 'multiline assignment'
  # > @string = "input " +
  # . "may span many " +
  # . "lines"
  # > string
  # "input may span many lines"

  15: 'spaces following "//" and ">" are optional'
  #>"no spaces"
  #"no spaces"
  16: 'indented doctest'
  #     > "Docco-compatible whitespace"
  #     "Docco-compatible whitespace"
  17: '">" in doctest'
  # > 2 > 1
  # true

  18: 'comment on input line'
  # > "foo" + "bar" # comment
  # "foobar"
  19: 'comment on output line'
  # > 5 * 5
  # 25

  20: 'variable in creation context is not accessible'
  # > typeof text
  # "undefined"

  21: '"." can follow leading "." in multiline expressions'
  # >10 -
  # ..5
  # 9.5

  22: 'the rewriter should not rely on automatic semicolon insertion'
  # > "the rewriter should not rely"
  # "on automatic semicolon insertion"
  (4 + 4)
