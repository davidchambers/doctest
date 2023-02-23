export default ({Test, Line, Incorrect, Correct, Failure, Success}) => [

  Test ('input evaluates to Error with expected message')
       ([Line (2) ("> new Error('Invalid value')")])
       ([Line (3) ("new Error('Invalid value')")])
       (Correct (Success (new Error ('Invalid value')))),

  Test ('input evaluates to Error without expected message')
       ([Line (5) ('> new Error()')])
       ([Line (6) ("new Error('Invalid value')")])
       (Incorrect (Success (new Error ()))
                  (Success (new Error ('Invalid value')))),

  Test ('input evaluates to Error with unexpected message')
       ([Line (8) ("> new Error('Invalid value')")])
       ([Line (9) ('new Error()')])
       (Incorrect (Success (new Error ('Invalid value')))
                  (Success (new Error ()))),

  Test ('input evaluates to Error with unexpected message')
       ([Line (11) ("> new Error('Invalid value')")])
       ([Line (12) ("new Error('XXX')")])
       (Incorrect (Success (new Error ('Invalid value')))
                  (Success (new Error ('XXX')))),

  Test ('evaluating input does not throw expected exception')
       ([Line (14) ("> new Error('Invalid value')")])
       ([Line (15) ('! Error: Invalid value')])
       (Incorrect (Success (new Error ('Invalid value')))
                  (Failure (new Error ('Invalid value')))),

  Test ('evaluating input throws unexpected exception')
       ([Line (17) ('> sqrt(-1)')])
       ([Line (18) ("new Error('Invalid value')")])
       (Incorrect (Failure (new Error ('Invalid value')))
                  (Success (new Error ('Invalid value')))),

  Test ('evaluating input throws exception as expected, of expected type')
       ([Line (20) ('> 0..toString(1)')])
       ([Line (21) ('! RangeError')])
       (Correct (Failure (new RangeError ('toString() radix argument must be between 2 and 36')))),

  Test ('evaluating input throws exception as expected, of unexpected type')
       ([Line (23) ('> 0..toString(1)')])
       ([Line (24) ('! Error')])
       (Incorrect (Failure (new RangeError ('toString() radix argument must be between 2 and 36')))
                  (Failure (new Error ()))),

  Test ('evaluating input throws exception as expected, with expected message')
       ([Line (26) ('> sqrt(-1)')])
       ([Line (27) ('! Error: Invalid value')])
       (Correct (Failure (new Error ('Invalid value')))),

  Test ('evaluating input throws exception as expected, with unexpected message')
       ([Line (29) ('> sqrt(-1)')])
       ([Line (30) ('! Error: XXX')])
       (Incorrect (Failure (new Error ('Invalid value')))
                  (Failure (new Error ('XXX')))),

  Test ('evaluating output throws unexpected exception')
       ([Line (32) ("> 'foo' + 'bar'")])
       ([Line (33) ('foobar')])
       (Incorrect (Success ('foobar'))
                  (Failure (new ReferenceError ('foobar is not defined')))),

];
