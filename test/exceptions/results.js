export default ({Test, Line, Incorrect, Correct, Failure, Success, Result}) => [

  Test ('input evaluates to Error with expected message')
       ([Line (2) ("> new Error('Invalid value')")])
       ([Line (3) ("new Error('Invalid value')")])
       (Correct ([Success (Result (new Error ('Invalid value')))])),

  Test ('input evaluates to Error without expected message')
       ([Line (5) ('> new Error()')])
       ([Line (6) ("new Error('Invalid value')")])
       (Incorrect ([Success (Result (new Error ()))])
                  ([Success (Result (new Error ('Invalid value')))])),

  Test ('input evaluates to Error with unexpected message')
       ([Line (8) ("> new Error('Invalid value')")])
       ([Line (9) ('new Error()')])
       (Incorrect ([Success (Result (new Error ('Invalid value')))])
                  ([Success (Result (new Error ()))])),

  Test ('input evaluates to Error with unexpected message')
       ([Line (11) ("> new Error('Invalid value')")])
       ([Line (12) ("new Error('XXX')")])
       (Incorrect ([Success (Result (new Error ('Invalid value')))])
                  ([Success (Result (new Error ('XXX')))])),

  Test ('evaluating input does not throw expected exception')
       ([Line (14) ("> new Error('Invalid value')")])
       ([Line (15) ("throw new Error('Invalid value')")])
       (Incorrect ([Success (Result (new Error ('Invalid value')))])
                  ([Failure (new Error ('Invalid value'))])),

  Test ('evaluating input throws unexpected exception')
       ([Line (17) ('> sqrt(-1)')])
       ([Line (18) ("new Error('Invalid value')")])
       (Incorrect ([Failure (new Error ('Invalid value'))])
                  ([Success (Result (new Error ('Invalid value')))])),

  Test ('evaluating input throws exception as expected, of expected type')
       ([Line (20) ('> 0..toString(1)')])
       ([Line (21) ('throw new RangeError')])
       (Correct ([Failure (new RangeError ('toString() radix argument must be between 2 and 36'))])),

  Test ('evaluating input throws exception as expected, of unexpected type')
       ([Line (23) ('> 0..toString(1)')])
       ([Line (24) ('throw new Error')])
       (Incorrect ([Failure (new RangeError ('toString() radix argument must be between 2 and 36'))])
                  ([Failure (new Error ())])),

  Test ('evaluating input throws exception as expected, with expected message')
       ([Line (26) ('> sqrt(-1)')])
       ([Line (27) ("throw new Error('Invalid value')")])
       (Correct ([Failure (new Error ('Invalid value'))])),

  Test ('evaluating input throws exception as expected, with unexpected message')
       ([Line (29) ('> sqrt(-1)')])
       ([Line (30) ("throw new Error('XXX')")])
       (Incorrect ([Failure (new Error ('Invalid value'))])
                  ([Failure (new Error ('XXX'))])),

  Test ('evaluating output throws unexpected exception')
       ([Line (32) ("> 'foo' + 'bar'")])
       ([Line (33) ('foobar')])
       (Incorrect ([Success (Result ('foobar'))])
                  ([Failure (new ReferenceError ('foobar is not defined'))])),

  Test ('evaluating input throws non-Error exception as expected')
       ([Line (35) ('> (() => { throw [1, 2, 3] })()')])
       ([Line (36) ('throw [1, 2, 3]')])
       (Correct ([Failure ([1, 2, 3])])),

];
