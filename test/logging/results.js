export default ({Test, Line, Incorrect, Correct, Failure, Success, Result, Channel}) => [

  Test ('synchronous log with output')
       ([Line (5) ('> (stdout (1), 2)')])
       ([Line (6) ('stdout (1)'),
         Line (7) ('return 2')])
       (Correct ([Success (Channel ('stdout') (1)),
                  Success (Result (2))])),

  Test ('synchronous log with exception')
       ([Line (11) ('> (stdout (1), crash ())')])
       ([Line (12) ('stdout (1)'),
         Line (13) ("throw new Error ('')")])
       (Correct ([Success (Channel ('stdout') (1)),
                  Failure (new Error (''))])),

  Test ('asynchronous log with output')
       ([Line (17) ('> (setImmediate (stdout, 1), 2)')])
       ([Line (18) ('return 2'),
         Line (19) ('stdout (1)')])
       (Correct ([Success (Result (2)),
                  Success (Channel ('stdout') (1))])),

  Test ('asynchronous log with exception')
       ([Line (23) ('> (setImmediate (stdout, 1), crash ())')])
       ([Line (24) ("throw new Error ('')"),
         Line (25) ('stdout (1)')])
       (Correct ([Failure (new Error ('')),
                  Success (Channel ('stdout') (1))])),

  Test ('failure due to not enough output')
       ([Line (29) ('> (stdout (1), 3)')])
       ([Line (30) ('stdout (1)'),
         Line (31) ('stdout (2)'),
         Line (32) ('return 3')])
       (Incorrect ([Success (Channel ('stdout') (1)),
                    Success (Result (3))])
                  ([Success (Channel ('stdout') (1)),
                    Success (Channel ('stdout') (2)),
                    Success (Result (3))])),

  Test ('failure due to too much output')
       ([Line (36) ('> (stdout (1), stdout (2), 3)')])
       ([Line (37) ('stdout (1)'),
         Line (38) ('return 3')])
       (Incorrect ([Success (Channel ('stdout') (1)),
                    Success (Channel ('stdout') (2)),
                    Success (Result (3))])
                  ([Success (Channel ('stdout') (1)),
                    Success (Result (3))])),

  Test ('failure due to incorrectly ordered output')
       ([Line (42) ('> (stdout (1), stdout (2), 3)')])
       ([Line (43) ('stdout (2)'),
         Line (44) ('stdout (1)'),
         Line (45) ('return 3')])
       (Incorrect ([Success (Channel ('stdout') (1)),
                    Success (Channel ('stdout') (2)),
                    Success (Result (3))])
                  ([Success (Channel ('stdout') (2)),
                    Success (Channel ('stdout') (1)),
                    Success (Result (3))])),

  Test ('failure due to output on the wrong channel')
       ([Line (49) ('> (stdout (1), stdout (2), 3)')])
       ([Line (50) ('stdout (1)'),
         Line (51) ('stderr (2)'),
         Line (52) ('return 3')])
       (Incorrect ([Success (Channel ('stdout') (1)),
                    Success (Channel ('stdout') (2)),
                    Success (Result (3))])
                  ([Success (Channel ('stdout') (1)),
                    Success (Channel ('stderr') (2)),
                    Success (Result (3))])),

  Test ('failure due to timing out')
       ([Line (56) ('> (setTimeout (stdout, 125, 1), 2)')])
       ([Line (57) ('return 2'),
         Line (58) ('stdout (1)')])
       (Incorrect ([Success (Result (2))])
                  ([Success (Result (2)),
                    Success (Channel ('stdout') (1))])),

  Test ('success after a previous timeout')
       ([Line (62) ('> (setTimeout (stdout, 75, 1), 2)')])
       ([Line (63) ('return 2'),
         Line (64) ('stdout (1)')])
       (Correct ([Success (Result (2)),
                  Success (Channel ('stdout') (1))])),

];
