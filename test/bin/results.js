export default ({Test, Line, Correct, Success, Result}) => [

  Test ('executable without file extension')
       ([Line (3) ('> identity(42)')])
       ([Line (4) ('42')])
       (Correct ([Success (Result (42))])),

];
