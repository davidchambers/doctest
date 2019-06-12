// > function crash() { throw new Error ('') }

// Synchronous log with output
//
// > (stdout (1), 2)
// stdout (1)
// return 2

// Synchronous log with exception
//
// > (stdout (1), crash ())
// stdout (1)
// throw new Error ('')

// Asynchronous log with output
//
// > (setImmediate (stdout, 1), 2)
// return 2
// stdout (1)

// Asynchronous log with exception
//
// > (setImmediate (stdout, 1), crash ())
// throw new Error ('')
// stdout (1)

// Failure due to not enough output
//
// > (stdout (1), 3)
// stdout (1)
// stdout (2)
// return 3

// Failure due to too much output
//
// > (stdout (1), stdout (2), 3)
// stdout (1)
// return 3

// Failure due to incorrectly ordered output
//
// > (stdout (1), stdout (2), 3)
// stdout (2)
// stdout (1)
// return 3

// Failure due to output on the wrong channel
//
// > (stdout (1), stdout (2), 3)
// stdout (1)
// stderr (2)
// return 3

// Failure due to timing out
//
// > (setTimeout (stdout, 125, 1), 2)
// return 2
// stdout (1)

// Success after a previous timeout
//
// > (setTimeout (stdout, 75, 1), 2)
// return 2
// stdout (1)
