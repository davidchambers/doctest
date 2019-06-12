export default ({Test, Line, Correct, Success, Result}) => [

  Test ('__filename is defined')
       ([Line (3) ('> typeof __filename')])
       ([Line (4) ("'string'")])
       (Correct ([Success (Result ('string'))])),

  Test ('__filename is absolute')
       ([Line (8) ('> path.isAbsolute (__filename)')])
       ([Line (9) ('true')])
       (Correct ([Success (Result (true))])),

  Test ('__filename is correct')
       ([Line (11) ('> path.relative (process.cwd (), __filename)')])
       ([Line (12) ("'test/commonjs/__filename/index.js'")])
       (Correct ([Success (Result ('test/commonjs/__filename/index.js'))])),

];
