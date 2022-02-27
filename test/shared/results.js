export default [
  [
    'global variable accessible in outer scope',
    [
      true,
      '"global"',
      '"global"',
      3,
    ],
  ],
  [
    'global variable accessible in inner scope',
    [
      true,
      '"global"',
      '"global"',
      10,
    ],
  ],
  [
    'local variable referenced, not shadowed global',
    [
      true,
      '"shadowed"',
      '"shadowed"',
      14,
    ],
  ],
  [
    'local variable accessible before declaration',
    [
      true,
      '2',
      '2',
      20,
    ],
  ],
  [
    'assignment is an expression',
    [
      true,
      '3',
      '3',
      25,
    ],
  ],
  [
    'variable declared in doctest remains accessible',
    [
      true,
      '[1, 2, 3]',
      '[1, 2, 3]',
      28,
    ],
  ],
  [
    'arithmetic error reported',
    [
      false,
      '4',
      '5',
      31,
    ],
  ],
  [
    'TypeError captured and reported',
    [
      true,
      '! TypeError',
      '! TypeError',
      35,
    ],
  ],
  [
    'TypeError expected but not reported',
    [
      false,
      '0',
      '! TypeError',
      38,
    ],
  ],
  [
    'function accessible before declaration',
    [
      true,
      '12',
      '12',
      42,
    ],
  ],
  [
    'NaN can be used as expected result',
    [
      true,
      'NaN',
      'NaN',
      45,
    ],
  ],
  [
    'function accessible after declaration',
    [
      true,
      '4',
      '4',
      53,
    ],
  ],
  [
    'multiline input',
    [
      true,
      '[1, 2, 3, 4, 5, 6, 7, 8, 9]',
      '[1, 2, 3, 4, 5, 6, 7, 8, 9]',
      65,
    ],
  ],
  [
    'multiline assignment',
    [
      true,
      '"input may span many lines"',
      '"input may span many lines"',
      71,
    ],
  ],
  [
    "spaces following '//' and '>' are optional",
    [
      true,
      '"no spaces"',
      '"no spaces"',
      75,
    ],
  ],
  [
    'indented doctest',
    [
      true,
      '"Docco-compatible whitespace"',
      '"Docco-compatible whitespace"',
      78,
    ],
  ],
  [
    "'>' in doctest",
    [
      true,
      'true',
      'true',
      81,
    ],
  ],
  [
    'comment on input line',
    [
      true,
      '"foobar"',
      '"foobar"',
      85,
    ],
  ],
  [
    'comment on output line',
    [
      true,
      '25',
      '25',
      88,
    ],
  ],
  [
    'variable in creation context is not accessible',
    [
      true,
      '"undefined"',
      '"undefined"',
      92,
    ],
  ],
  [
    "'.' should not follow leading '.' in multiline expressions",
    [
      false,
      '5',
      '9.5',
      97,
    ],
  ],
  [
    "wrapped lines may begin with more than one '.'",
    [
      true,
      '1234.5',
      '1234.5',
      105,
    ],
  ],
  [
    'multiline comment',
    [
      true,
      '23',
      '23',
      110,
    ],
  ],
  [
    'multiline comment with wrapped input',
    [
      true,
      '"FOO BAR"',
      '"FOO BAR"',
      119,
    ],
  ],
  [
    'multiline comment with leading asterisks',
    [
      true,
      '25',
      '25',
      125,
    ],
  ],
  [
    'multiline comment with leading asterisks',
    [
      true,
      '25',
      '25',
      127,
    ],
  ],
  [
    'multiline comment with leading asterisks and wrapped input',
    [
      true,
      '55',
      '55',
      135,
    ],
  ],
  [
    'multiline output',
    [
      true,
      '["foo", "bar", "baz"]',
      '["foo", "bar", "baz"]',
      140,
    ],
  ],
  [
    'multiline input with multiline output',
    [
      true,
      '["FOO", "BAR", "BAZ"]',
      '["FOO", "BAR", "BAZ"]',
      149,
    ],
  ],
];
