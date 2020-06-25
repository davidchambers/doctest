export default ({Test, Line, Correct, Success}) => [

  Test ('setTimeout is defined')
       ([Line (1) ('> typeof setTimeout')])
       ([Line (2) ("'function'")])
       (Correct (Success ('function'))),

];
