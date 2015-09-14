
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

// > null.length
// ! TypeError

// > null.length
// ! Error

// > sqrt(-1)
// ! Error: Invalid value

// > sqrt(-1)
// ! Error: XXX

var sqrt = function(n) {
  if (n >= 0) {
    return Math.sqrt(n);
  } else {
    throw new Error('Invalid value');
  }
};
