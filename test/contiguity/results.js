export default ({Test, Line, Correct, Success, Result}) => [

  Test ('output line immediately following input line')
       ([Line (15) ('> zero (42)')])
       ([Line (16) ('0')])
       (Correct ([Success (Result (0))])),

];
