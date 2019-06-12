export default ({Test, Line, Correct, Success, Result}) => [

  Test ('module.exports')
       ([Line (1) ('> module.exports(42)')])
       ([Line (2) ('42')])
       (Correct ([Success (Result (42))])),

];
