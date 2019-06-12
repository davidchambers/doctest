export default ({Test, Line, Correct, Success, Result}) => [

  Test ('seq.next().value')
       ([Line (12) ('> seq.next().value')])
       ([Line (13) ('1')])
       (Correct ([Success (Result (1))])),

  Test ('seq.next().value')
       ([Line (14) ('> seq.next().value')])
       ([Line (15) ('1')])
       (Correct ([Success (Result (1))])),

  Test ('seq.next().value')
       ([Line (16) ('> seq.next().value')])
       ([Line (17) ('2')])
       (Correct ([Success (Result (2))])),

  Test ('seq.next().value')
       ([Line (18) ('> seq.next().value')])
       ([Line (19) ('3')])
       (Correct ([Success (Result (3))])),

  Test ('seq.next().value')
       ([Line (20) ('> seq.next().value')])
       ([Line (21) ('5')])
       (Correct ([Success (Result (5))])),

];
