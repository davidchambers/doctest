export default [
  {
    description: 'global variable accessible in outer scope',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 2, text: '> global'},
        ],
        throws: false,
        result: 'global',
      },
      output: {
        lines: [
          {number: 3, text: '"global"'},
        ],
        throws: false,
        result: 'global',
      },
    },
  },
  {
    description: 'global variable accessible in inner scope',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 9, text: '> global'},
        ],
        throws: false,
        result: 'global',
      },
      output: {
        lines: [
          {number: 10, text: '"global"'},
        ],
        throws: false,
        result: 'global',
      },
    },
  },
  {
    description: 'local variable referenced, not shadowed global',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 13, text: '> global'},
        ],
        throws: false,
        result: 'shadowed',
      },
      output: {
        lines: [
          {number: 14, text: '"shadowed"'},
        ],
        throws: false,
        result: 'shadowed',
      },
    },
  },
  {
    description: 'local variable accessible before declaration',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 19, text: '> one * two'},
        ],
        throws: false,
        result: 2,
      },
      output: {
        lines: [
          {number: 20, text: '2'},
        ],
        throws: false,
        result: 2,
      },
    },
  },
  {
    description: 'assignment is an expression',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 24, text: '> three = one + two'},
        ],
        throws: false,
        result: 3,
      },
      output: {
        lines: [
          {number: 25, text: '3'},
        ],
        throws: false,
        result: 3,
      },
    },
  },
  {
    description: 'variable declared in doctest remains accessible',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 27, text: '> [one, two, three]'},
        ],
        throws: false,
        result: [1, 2, 3],
      },
      output: {
        lines: [
          {number: 28, text: '[1, 2, 3]'},
        ],
        throws: false,
        result: [1, 2, 3],
      },
    },
  },
  {
    description: 'arithmetic error reported',
    doctest: {
      correct: false,
      input: {
        lines: [
          {number: 30, text: '> two + two'},
        ],
        throws: false,
        result: 4,
      },
      output: {
        lines: [
          {number: 31, text: '5'},
        ],
        throws: false,
        result: 5,
      },
    },
  },
  {
    description: 'TypeError captured and reported',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 34, text: '> null.length'},
        ],
        throws: true,
        exception: new TypeError ("Cannot read property 'length' of null"),
      },
      output: {
        lines: [
          {number: 35, text: '! TypeError'},
        ],
        throws: true,
        exception: new TypeError (),
      },
    },
  },
  {
    description: 'TypeError expected but not reported',
    doctest: {
      correct: false,
      input: {
        lines: [
          {number: 37, text: '> [].length'},
        ],
        throws: false,
        result: 0,
      },
      output: {
        lines: [
          {number: 38, text: '! TypeError'},
        ],
        throws: true,
        exception: new TypeError (),
      },
    },
  },
  {
    description: 'function accessible before declaration',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 41, text: '> double(6)'},
        ],
        throws: false,
        result: 12,
      },
      output: {
        lines: [
          {number: 42, text: '12'},
        ],
        throws: false,
        result: 12,
      },
    },
  },
  {
    description: 'NaN can be used as expected result',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 44, text: '> double()'},
        ],
        throws: false,
        result: NaN,
      },
      output: {
        lines: [
          {number: 45, text: 'NaN'},
        ],
        throws: false,
        result: NaN,
      },
    },
  },
  {
    description: 'function accessible after declaration',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 52, text: '> double.call(null, 2)'},
        ],
        throws: false,
        result: 4,
      },
      output: {
        lines: [
          {number: 53, text: '4'},
        ],
        throws: false,
        result: 4,
      },
    },
  },
  {
    description: 'multiline input',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 62, text: '> [1,2,3,'},
          {number: 63, text: '.  4,5,6,'},
          {number: 64, text: '.  7,8,9]'},
        ],
        throws: false,
        result: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      output: {
        lines: [
          {number: 65, text: '[1,2,3,4,5,6,7,8,9]'},
        ],
        throws: false,
        result: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    },
  },
  {
    description: 'multiline assignment',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 70, text: '> string'},
        ],
        throws: false,
        result: 'input may span many lines',
      },
      output: {
        lines: [
          {number: 71, text: '"input may span many lines"'},
        ],
        throws: false,
        result: 'input may span many lines',
      },
    },
  },
  {
    description: "spaces following '//' and '>' are optional",
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 74, text: '>"no spaces"'},
        ],
        throws: false,
        result: 'no spaces',
      },
      output: {
        lines: [
          {number: 75, text: '"no spaces"'},
        ],
        throws: false,
        result: 'no spaces',
      },
    },
  },
  {
    description: 'indented doctest',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 77, text: '> "Docco-compatible whitespace"'},
        ],
        throws: false,
        result: 'Docco-compatible whitespace',
      },
      output: {
        lines: [
          {number: 78, text: '"Docco-compatible whitespace"'},
        ],
        throws: false,
        result: 'Docco-compatible whitespace',
      },
    },
  },
  {
    description: "'>' in doctest",
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 80, text: '> 2 > 1'},
        ],
        throws: false,
        result: true,
      },
      output: {
        lines: [
          {number: 81, text: 'true'},
        ],
        throws: false,
        result: true,
      },
    },
  },
  {
    description: 'comment on input line',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 84, text: '> "foo" + "bar" // comment'},
        ],
        throws: false,
        result: 'foobar',
      },
      output: {
        lines: [
          {number: 85, text: '"foobar"'},
        ],
        throws: false,
        result: 'foobar',
      },
    },
  },
  {
    description: 'comment on output line',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 87, text: '> 5 * 5'},
        ],
        throws: false,
        result: 25,
      },
      output: {
        lines: [
          {number: 88, text: '25 // comment'},
        ],
        throws: false,
        result: 25,
      },
    },
  },
  {
    description: 'variable in creation context is not accessible',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 91, text: '> typeof Z'},
        ],
        throws: false,
        result: 'undefined',
      },
      output: {
        lines: [
          {number: 92, text: '"undefined"'},
        ],
        throws: false,
        result: 'undefined',
      },
    },
  },
  {
    description: "'.' should not follow leading '.' in multiline expressions",
    doctest: {
      correct: false,
      input: {
        lines: [
          {number: 95, text: '>10 -'},
          {number: 96, text: '..5'},
        ],
        throws: false,
        result: 5,
      },
      output: {
        lines: [
          {number: 97, text: '9.5'},
        ],
        throws: false,
        result: 9.5,
      },
    },
  },
  {
    description: "wrapped lines may begin with more than one '.'",
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 100, text: '> 1000 +'},
          {number: 101, text: '.. 200 +'},
          {number: 102, text: '... 30 +'},
          {number: 103, text: '.... 4 +'},
          {number: 104, text: '..... .5'},
        ],
        throws: false,
        result: 1234.5,
      },
      output: {
        lines: [
          {number: 105, text: '1234.5'},
        ],
        throws: false,
        result: 1234.5,
      },
    },
  },
  {
    description: 'multiline comment',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 109, text: '> Math.pow(3, 3) - Math.pow(2, 2)'},
        ],
        throws: false,
        result: 23,
      },
      output: {
        lines: [
          {number: 110, text: '23'},
        ],
        throws: false,
        result: 23,
      },
    },
  },
  {
    description: 'multiline comment with wrapped input',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 115, text: '> ["foo", "bar", "baz"]'},
          {number: 116, text: '. .slice(0, -1)'},
          {number: 117, text: '. .join(" ")'},
          {number: 118, text: '. .toUpperCase()'},
        ],
        throws: false,
        result: 'FOO BAR',
      },
      output: {
        lines: [
          {number: 119, text: '"FOO BAR"'},
        ],
        throws: false,
        result: 'FOO BAR',
      },
    },
  },
  {
    description: 'multiline comment with leading asterisks',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 124, text: '> 1 + 2 * 3 * 4'},
        ],
        throws: false,
        result: 25,
      },
      output: {
        lines: [
          {number: 125, text: '25'},
        ],
        throws: false,
        result: 25,
      },
    },
  },
  {
    description: 'multiline comment with leading asterisks',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 126, text: '> 1 * 2 + 3 + 4 * 5'},
        ],
        throws: false,
        result: 25,
      },
      output: {
        lines: [
          {number: 127, text: '25'},
        ],
        throws: false,
        result: 25,
      },
    },
  },
  {
    description: 'multiline comment with leading asterisks and wrapped input',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 132, text: '> (function fib(n) {'},
          {number: 133, text: '.    return n == 0 || n == 1 ? n : fib(n - 2) + fib(n - 1);'},
          {number: 134, text: '.  })(10)'},
        ],
        throws: false,
        result: 55,
      },
      output: {
        lines: [
          {number: 135, text: '55'},
        ],
        throws: false,
        result: 55,
      },
    },
  },
  {
    description: 'multiline output',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 139, text: '> ["foo", "bar", "baz"]'},
        ],
        throws: false,
        result: ['foo', 'bar', 'baz'],
      },
      output: {
        lines: [
          {number: 140, text: '[ "foo",'},
          {number: 141, text: '. "bar",'},
          {number: 142, text: '. "baz" ]'},
        ],
        throws: false,
        result: ['foo', 'bar', 'baz'],
      },
    },
  },
  {
    description: 'multiline input with multiline output',
    doctest: {
      correct: false,
      input: {
        lines: [
          {number: 145, text: '> ["foo", "bar", "baz"]'},
          {number: 146, text: '. .join(",")'},
          {number: 147, text: '. .toUpperCase()'},
          {number: 148, text: '. .split(",")'},
        ],
        throws: false,
        result: ['FOO', 'BAR', 'BAZ'],
      },
      output: {
        lines: [
          {number: 149, text: '[ "FOO",'},
          {number: 150, text: '. "BAR",'},
          {number: 151, text: '. "BAZ",'},
          {number: 152, text: '. "XXX" ]'},
        ],
        throws: false,
        result: ['FOO', 'BAR', 'BAZ', 'XXX'],
      },
    },
  },
];
