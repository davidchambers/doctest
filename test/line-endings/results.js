export default ({Test, Line, Correct, Success, Result}) => [

  Test ('correct line number reported irrespective of line endings')
       ([Line (1) ('> 2 * 3 * 7')])
       ([Line (2) ('42')])
       (Correct ([Success (Result (42))])),

];
