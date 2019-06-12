export default ({Test, Line, Incorrect, Correct, Failure, Success, Result}) => [

  Test ('global variable accessible in outer scope')
       ([Line (2) ('> global')])
       ([Line (3) ('"global"')])
       (Correct ([Success (Result ('global'))])),

  Test ('global variable accessible in inner scope')
       ([Line (9) ('> global')])
       ([Line (10) ('"global"')])
       (Correct ([Success (Result ('global'))])),

  Test ('local variable referenced, not shadowed global')
       ([Line (13) ('> global')])
       ([Line (14) ('"shadowed"')])
       (Correct ([Success (Result ('shadowed'))])),

  Test ('local variable accessible before declaration')
       ([Line (19) ('> one * two')])
       ([Line (20) ('2')])
       (Correct ([Success (Result (2))])),

  Test ('assignment is an expression')
       ([Line (24) ('> @three = one + two')])
       ([Line (25) ('3')])
       (Correct ([Success (Result (3))])),

  Test ('variable declared in doctest remains accessible')
       ([Line (27) ('> [one, two, three]')])
       ([Line (28) ('[1, 2, 3]')])
       (Correct ([Success (Result ([1, 2, 3]))])),

  Test ('arithmetic error reported')
       ([Line (30) ('> two + two')])
       ([Line (31) ('5')])
       (Incorrect ([Success (Result (4))])
                  ([Success (Result (5))])),

  Test ('RangeError captured and reported')
       ([Line (34) ('> 0.toString 1')])
       ([Line (35) ('throw new RangeError')])
       (Correct ([Failure (new RangeError ('toString() radix argument must be between 2 and 36'))])),

  Test ('TypeError expected but not reported')
       ([Line (37) ('> [].length')])
       ([Line (38) ('throw new TypeError')])
       (Incorrect ([Success (Result (0))])
                  ([Failure (new TypeError ())])),

  Test ('function accessible before declaration')
       ([Line (41) ('> double(6)')])
       ([Line (42) ('12')])
       (Correct ([Success (Result (12))])),

  Test ('NaN can be used as expected result')
       ([Line (44) ('> double()')])
       ([Line (45) ('NaN')])
       (Correct ([Success (Result (NaN))])),

  Test ('function accessible after declaration')
       ([Line (52) ('> double.call(null, 2)')])
       ([Line (53) ('4')])
       (Correct ([Success (Result (4))])),

  Test ('multiline input')
       ([Line (62) ('> [1,2,3,'),
         Line (63) ('.  4,5,6,'),
         Line (64) ('.  7,8,9]')])
       ([Line (65) ('[1,2,3,4,5,6,7,8,9]')])
       (Correct ([Success (Result ([1, 2, 3, 4, 5, 6, 7, 8, 9]))])),

  Test ('multiline assignment')
       ([Line (70) ('> string')])
       ([Line (71) ('"input may span many lines"')])
       (Correct ([Success (Result ('input may span many lines'))])),

  Test ("spaces following '#' and '>' are optional")
       ([Line (74) ('>"no spaces"')])
       ([Line (75) ('"no spaces"')])
       (Correct ([Success (Result ('no spaces'))])),

  Test ('indented doctest')
       ([Line (77) ('> "Docco-compatible whitespace"')])
       ([Line (78) ('"Docco-compatible whitespace"')])
       (Correct ([Success (Result ('Docco-compatible whitespace'))])),

  Test ("'>' in doctest")
       ([Line (80) ('> 2 > 1')])
       ([Line (81) ('true')])
       (Correct ([Success (Result (true))])),

  Test ('comment on input line')
       ([Line (84) ('> "foo" + "bar" # comment')])
       ([Line (85) ('"foobar"')])
       (Correct ([Success (Result ('foobar'))])),

  Test ('comment on output line')
       ([Line (87) ('> 5 * 5')])
       ([Line (88) ('25 # comment')])
       (Correct ([Success (Result (25))])),

  Test ('variable in creation context is not accessible')
       ([Line (91) ('> typeof text')])
       ([Line (92) ('"undefined"')])
       (Correct ([Success (Result ('undefined'))])),

  Test ("'.' should not follow leading '.' in multiline expressions")
       ([Line (95) ('>10 -'),
         Line (96) ('..5')])
       ([Line (97) ('9.5')])
       (Incorrect ([Success (Result (5))])
                  ([Success (Result (9.5))])),

  Test ("wrapped lines may begin with more than one '.'")
       ([Line (100) ('> 1000 +'),
         Line (101) ('.. 200 +'),
         Line (102) ('... 30 +'),
         Line (103) ('.... 4 +'),
         Line (104) ('..... .5')])
       ([Line (105) ('1234.5')])
       (Correct ([Success (Result (1234.5))])),

  Test ('multiline comment')
       ([Line (109) ('> 3 ** 3 - 2 ** 2')])
       ([Line (110) ('23')])
       (Correct ([Success (Result (23))])),

  Test ('multiline comment with wrapped input')
       ([Line (115) ('> (["foo", "bar", "baz"]'),
         Line (116) ('.  .slice(0, -1)'),
         Line (117) ('.  .join(" ")'),
         Line (118) ('.  .toUpperCase())')])
       ([Line (119) ('"FOO BAR"')])
       (Correct ([Success (Result ('FOO BAR'))])),

  Test ('multiline output')
       ([Line (139) ('> ["foo", "bar", "baz"]')])
       ([Line (140) ('[ "foo"'),
         Line (141) ('. "bar"'),
         Line (142) ('. "baz" ]')])
       (Correct ([Success (Result (['foo', 'bar', 'baz']))])),

  Test ('multiline input with multiline output')
       ([Line (145) ('> ["foo", "bar", "baz"]'),
         Line (146) ('. .join(",")'),
         Line (147) ('. .toUpperCase()'),
         Line (148) ('. .split(",")')])
       ([Line (149) ('[ "FOO"'),
         Line (150) ('. "BAR"'),
         Line (151) ('. "BAZ" ]')])
       (Correct ([Success (Result (['FOO', 'BAR', 'BAZ']))])),

];
