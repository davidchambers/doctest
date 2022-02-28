export default ({Test, Line, Correct, Success}) => [

  Test ('__dirname is defined')
       ([Line (3) ('> typeof __dirname')])
       ([Line (4) ("'string'")])
       (Correct (Success ('string'))),

];
