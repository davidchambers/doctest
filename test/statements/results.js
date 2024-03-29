export default ({Test, Line, Correct, Success}) => [

  Test ('var')
       ([Line (3) ('> Math.sqrt(x)')])
       ([Line (4) ('8')])
       (Correct (Success (8))),

  Test ('let')
       ([Line (8) ('> Math.abs(y)')])
       ([Line (9) ('1')])
       (Correct (Success (1))),

  Test ('function declaration')
       ([Line (13) ('> fib(10)')])
       ([Line (14) ('55')])
       (Correct (Success (55))),

];
