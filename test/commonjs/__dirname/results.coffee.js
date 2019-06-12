export default ({Test, Line, Correct, Success, Result}) => [

  Test ('__dirname is defined')
       ([Line (3) ('> typeof __dirname')])
       ([Line (4) ("'string'")])
       (Correct ([Success (Result ('string'))])),

  Test ('__dirname is absolute')
       ([Line (8) ('> path.isAbsolute __dirname')])
       ([Line (9) ('true')])
       (Correct ([Success (Result (true))])),

  Test ('__dirname is correct')
       ([Line (11) ('> path.relative process.cwd(), __dirname')])
       ([Line (12) ("'test/commonjs/__dirname'")])
       (Correct ([Success (Result ('test/commonjs/__dirname'))])),

];
