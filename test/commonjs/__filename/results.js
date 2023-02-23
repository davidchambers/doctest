export default ({Test, Line, Correct, Success}) => [

  Test ('__filename is defined')
       ([Line (3) ('> typeof __filename')])
       ([Line (4) ("'string'")])
       (Correct (Success ('string'))),

];
