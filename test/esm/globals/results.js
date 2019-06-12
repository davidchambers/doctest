export default ({Test, Line, Correct, Success, Result}) => [

  Test ('setTimeout is defined')
       ([Line (1) ('> typeof setTimeout')])
       ([Line (2) ("'function'")])
       (Correct ([Success (Result ('function'))])),

];
