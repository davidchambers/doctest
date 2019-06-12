
// > new Error('Invalid value')
// new Error('Invalid value')

// > new Error()
// new Error('Invalid value')

// > new Error('Invalid value')
// new Error()

// > new Error('Invalid value')
// new Error('XXX')

// > new Error('Invalid value')
// throw new Error('Invalid value')

// > sqrt(-1)
// new Error('Invalid value')

// > 0..toString(1)
// throw new RangeError

// > 0..toString(1)
// throw new Error

// > sqrt(-1)
// throw new Error('Invalid value')

// > sqrt(-1)
// throw new Error('XXX')

// > 'foo' + 'bar'
// foobar

// > (() => { throw [1, 2, 3] })()
// throw [1, 2, 3]

var sqrt = function(n) {
  if (n >= 0) {
    return Math.sqrt(n);
  } else {
    throw new Error('Invalid value');
  }
};
