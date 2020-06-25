export default ({Test, Line, Correct, Success}) => [

  Test ('__filename is defined')
       ([Line (3) ('> typeof __filename')])
       ([Line (4) ("'string'")])
       (Correct (Success ('string'))),

  Test ('__filename is absolute')
       ([Line (8) ('> path.isAbsolute __filename')])
       ([Line (9) ('true')])
       (Correct (Success (true))),

  Test ('__filename is correct')
       ([Line (11) ('> path.relative process.cwd(), __filename')])
       ([Line (12) ("'test/commonjs/__filename/index.coffee'")])
       (Correct (Success ('test/commonjs/__filename/index.coffee'))),

];
