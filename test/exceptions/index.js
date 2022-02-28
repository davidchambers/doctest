
// > new Error('Invalid value')
// new Error('Invalid value')

// > new Error()
// new Error('Invalid value')

// > new Error('Invalid value')
// new Error()

// > new Error('Invalid value')
// new Error('XXX')

// > new Error('Invalid value')
// ! Error: Invalid value

// > sqrt(-1)
// new Error('Invalid value')

// > 0..toString(1)
// ! RangeError

// > 0..toString(1)
// ! Error

// > sqrt(-1)
// ! Error: Invalid value

// > sqrt(-1)
// ! Error: XXX

// > 'foo' + 'bar'
// foobar

var sqrt = function(n) {
  if (n >= 0) {
    return Math.sqrt(n);
  } else {
    throw new Error('Invalid value');
  }
};
