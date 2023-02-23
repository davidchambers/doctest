//    Incorrect :: Array Effect -> Array Effect -> Comparison
const Incorrect = actual => expected => ({
  tag: 'Incorrect',
  actual,
  expected,
});

//    Correct :: Array Effect -> Comparison
const Correct = actual => ({
  tag: 'Correct',
  actual,
});

//    comparison :: (Array Effect -> Array Effect -> a)
//               -> (Array Effect -> a)
//               -> Comparison
//               -> a
const comparison = incorrect => correct => comparison => {
  switch (comparison.tag) {
    case 'Incorrect':
      return incorrect (comparison.actual) (comparison.expected);
    case 'Correct':
      return correct (comparison.actual);
  }
};


export {Incorrect, Correct, comparison};
