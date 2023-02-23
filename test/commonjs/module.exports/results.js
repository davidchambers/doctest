export default ({Test, Line, Correct, Success}) => [

  Test ('module.exports')
       ([Line (1) ('> module.exports(42)')])
       ([Line (2) ('42')])
       (Correct (Success (42))),

];
