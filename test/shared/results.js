export default ({Test, Line, Incorrect, Correct, Failure, Success}) => [

  Test ('global variable accessible in outer scope')
       ([Line (2) ('> global')])
       ([Line (3) ('"global"')])
       (Correct (Success ('global'))),

  Test ('global variable accessible in inner scope')
       ([Line (9) ('> global')])
       ([Line (10) ('"global"')])
       (Correct (Success ('global'))),

  Test ('local variable referenced, not shadowed global')
       ([Line (13) ('> global')])
       ([Line (14) ('"shadowed"')])
       (Correct (Success ('shadowed'))),

  Test ('local variable accessible before declaration')
       ([Line (19) ('> one * two')])
       ([Line (20) ('2')])
       (Correct (Success (2))),

  Test ('assignment is an expression')
       ([Line (24) ('> three = one + two')])
       ([Line (25) ('3')])
       (Correct (Success (3))),

  Test ('variable declared in doctest remains accessible')
       ([Line (27) ('> [one, two, three]')])
       ([Line (28) ('[1, 2, 3]')])
       (Correct (Success ([1, 2, 3]))),

  Test ('arithmetic error reported')
       ([Line (30) ('> two + two')])
       ([Line (31) ('5')])
       (Incorrect (Success (4))
                  (Success (5))),

  Test ('RangeError captured and reported')
       ([Line (34) ('> 0..toString(1)')])
       ([Line (35) ('! RangeError')])
       (Correct (Failure (new RangeError ('toString() radix argument must be between 2 and 36')))),

  Test ('TypeError expected but not reported')
       ([Line (37) ('> [].length')])
       ([Line (38) ('! TypeError')])
       (Incorrect (Success (0))
                  (Failure (new TypeError ()))),

  Test ('function accessible before declaration')
       ([Line (41) ('> double(6)')])
       ([Line (42) ('12')])
       (Correct (Success (12))),

  Test ('NaN can be used as expected result')
       ([Line (44) ('> double()')])
       ([Line (45) ('NaN')])
       (Correct (Success (NaN))),

  Test ('function accessible after declaration')
       ([Line (52) ('> double.call(null, 2)')])
       ([Line (53) ('4')])
       (Correct (Success (4))),

  Test ('multiline input')
       ([Line (62) ('> [1,2,3,'),
         Line (63) ('.  4,5,6,'),
         Line (64) ('.  7,8,9]')])
       ([Line (65) ('[1,2,3,4,5,6,7,8,9]')])
       (Correct (Success ([1, 2, 3, 4, 5, 6, 7, 8, 9]))),

  Test ('multiline assignment')
       ([Line (70) ('> string')])
       ([Line (71) ('"input may span many lines"')])
       (Correct (Success ('input may span many lines'))),

  Test ("spaces following '//' and '>' are optional")
       ([Line (74) ('>"no spaces"')])
       ([Line (75) ('"no spaces"')])
       (Correct (Success ('no spaces'))),

  Test ('indented doctest')
       ([Line (77) ('> "Docco-compatible whitespace"')])
       ([Line (78) ('"Docco-compatible whitespace"')])
       (Correct (Success ('Docco-compatible whitespace'))),

  Test ("'>' in doctest")
       ([Line (80) ('> 2 > 1')])
       ([Line (81) ('true')])
       (Correct (Success (true))),

  Test ('comment on input line')
       ([Line (84) ('> "foo" + "bar" // comment')])
       ([Line (85) ('"foobar"')])
       (Correct (Success ('foobar'))),

  Test ('comment on output line')
       ([Line (87) ('> 5 * 5')])
       ([Line (88) ('25 // comment')])
       (Correct (Success (25))),

  Test ('variable in creation context is not accessible')
       ([Line (91) ('> typeof text')])
       ([Line (92) ('"undefined"')])
       (Correct (Success ('undefined'))),

  Test ("'.' should not follow leading '.' in multiline expressions")
       ([Line (95) ('>10 -'),
         Line (96) ('..5')])
       ([Line (97) ('9.5')])
       (Incorrect (Success (5))
                  (Success (9.5))),

  Test ("wrapped lines may begin with more than one '.'")
       ([Line (100) ('> 1000 +'),
         Line (101) ('.. 200 +'),
         Line (102) ('... 30 +'),
         Line (103) ('.... 4 +'),
         Line (104) ('..... .5')])
       ([Line (105) ('1234.5')])
       (Correct (Success (1234.5))),

  Test ('multiline comment')
       ([Line (109) ('> Math.pow(3, 3) - Math.pow(2, 2)')])
       ([Line (110) ('23')])
       (Correct (Success (23))),

  Test ('multiline comment with wrapped input')
       ([Line (115) ('> ["foo", "bar", "baz"]'),
         Line (116) ('. .slice(0, -1)'),
         Line (117) ('. .join(" ")'),
         Line (118) ('. .toUpperCase()')])
       ([Line (119) ('"FOO BAR"')])
       (Correct (Success ('FOO BAR'))),

  Test ('multiline comment with leading asterisks')
       ([Line (124) ('> 1 + 2 * 3 * 4')])
       ([Line (125) ('25')])
       (Correct (Success (25))),

  Test ('multiline comment with leading asterisks')
       ([Line (126) ('> 1 * 2 + 3 + 4 * 5')])
       ([Line (127) ('25')])
       (Correct (Success (25))),

  Test ('multiline comment with leading asterisks and wrapped input')
       ([Line (132) ('> (function fib(n) {'),
         Line (133) ('.    return n == 0 || n == 1 ? n : fib(n - 2) + fib(n - 1);'),
         Line (134) ('.  })(10)')])
       ([Line (135) ('55')])
       (Correct (Success (55))),

  Test ('multiline output')
       ([Line (139) ('> ["foo", "bar", "baz"]')])
       ([Line (140) ('[ "foo",'),
         Line (141) ('. "bar",'),
         Line (142) ('. "baz" ]')])
       (Correct (Success (['foo', 'bar', 'baz']))),

  Test ('multiline input with multiline output')
       ([Line (145) ('> ["foo", "bar", "baz"]'),
         Line (146) ('. .join(",")'),
         Line (147) ('. .toUpperCase()'),
         Line (148) ('. .split(",")')])
       ([Line (149) ('[ "FOO",'),
         Line (150) ('. "BAR",'),
         Line (151) ('. "BAZ" ]')])
       (Correct (Success (['FOO', 'BAR', 'BAZ']))),

  Test ('the rewriter should not rely on automatic semicolon insertion')
       ([Line (154) ('> "the rewriter should not rely"')])
       ([Line (155) ('"on automatic semicolon insertion"')])
       (Incorrect (Success ('the rewriter should not rely'))
                  (Success ('on automatic semicolon insertion'))),

];
