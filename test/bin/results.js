export default ({Test, Line, Correct, Success}) => [

  Test ('executable without file extension')
       ([Line (3) ('> identity(42)')])
       ([Line (4) ('42')])
       (Correct (Success (42))),

];
