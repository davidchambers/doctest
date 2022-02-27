export default [
  [
    'input evaluates to Error with expected message',
    [
      true,
      'Error: Invalid value',
      'Error: Invalid value',
      3,
    ],
  ],
  [
    'input evaluates to Error without expected message',
    [
      false,
      'Error',
      'Error: Invalid value',
      6,
    ],
  ],
  [
    'input evaluates to Error with unexpected message',
    [
      false,
      'Error: Invalid value',
      'Error',
      9,
    ],
  ],
  [
    'input evaluates to Error with unexpected message',
    [
      false,
      'Error: Invalid value',
      'Error: XXX',
      12,
    ],
  ],
  [
    'evaluating input does not throw expected exception',
    [
      false,
      'Error: Invalid value',
      '! Error: Invalid value',
      15,
    ],
  ],
  [
    'evaluating input throws unexpected exception',
    [
      false,
      '! Error: Invalid value',
      'Error: Invalid value',
      18,
    ],
  ],
  [
    'evaluating input throws exception as expected, of expected type',
    [
      true,
      '! TypeError',
      '! TypeError',
      21,
    ],
  ],
  [
    'evaluating input throws exception as expected, of unexpected type',
    [
      false,
      '! TypeError',
      '! Error',
      24,
    ],
  ],
  [
    'evaluating input throws exception as expected, with expected message',
    [
      true,
      '! Error: Invalid value',
      '! Error: Invalid value',
      27,
    ],
  ],
  [
    'evaluating input throws exception as expected, with unexpected message',
    [
      false,
      '! Error: Invalid value',
      '! Error: XXX',
      30,
    ],
  ],
];
