export default ({Test, Line, Correct, Success}) => [

  Test ('exports')
       ([Line (1) ('> exports.identity(42)')])
       ([Line (2) ('42')])
       (Correct (Success (42))),

];
