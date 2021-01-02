export default [
  {
    description: 'global variable accessible in outer scope',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 2, text: '> global'},
        ],
        value: {throws: false, result: 'global'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 3, text: '"global"'},
        ],
        value: {throws: false, result: 'global'},
      }],
    },
  },
  {
    description: 'global variable accessible in inner scope',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 9, text: '> global'},
        ],
        value: {throws: false, result: 'global'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 10, text: '"global"'},
        ],
        value: {throws: false, result: 'global'},
      }],
    },
  },
  {
    description: 'local variable referenced, not shadowed global',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 13, text: '> global'},
        ],
        value: {throws: false, result: 'shadowed'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 14, text: '"shadowed"'},
        ],
        value: {throws: false, result: 'shadowed'},
      }],
    },
  },
  {
    description: 'local variable accessible before declaration',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 19, text: '> one * two'},
        ],
        value: {throws: false, result: 2},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 20, text: '2'},
        ],
        value: {throws: false, result: 2},
      }],
    },
  },
  {
    description: 'assignment is an expression',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 24, text: '> @three = one + two'},
        ],
        value: {throws: false, result: 3},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 25, text: '3'},
        ],
        value: {throws: false, result: 3},
      }],
    },
  },
  {
    description: 'variable declared in doctest remains accessible',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 27, text: '> [one, two, three]'},
        ],
        value: {throws: false, result: [1, 2, 3]},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 28, text: '[1, 2, 3]'},
        ],
        value: {throws: false, result: [1, 2, 3]},
      }],
    },
  },
  {
    description: 'arithmetic error reported',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 30, text: '> two + two'},
        ],
        value: {throws: false, result: 4},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 31, text: '5'},
        ],
        value: {throws: false, result: 5},
      }],
    },
  },
  {
    description: 'TypeError captured and reported',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 34, text: '> null.length'},
        ],
        value: {throws: true, exception: new TypeError ("Cannot read property 'length' of null")},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 35, text: '! TypeError'},
        ],
        value: {throws: true, exception: new TypeError ()},
      }],
    },
  },
  {
    description: 'TypeError expected but not reported',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 37, text: '> [].length'},
        ],
        value: {throws: false, result: 0},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 38, text: '! TypeError'},
        ],
        value: {throws: true, exception: new TypeError ()},
      }],
    },
  },
  {
    description: 'function accessible before declaration',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 41, text: '> double(6)'},
        ],
        value: {throws: false, result: 12},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 42, text: '12'},
        ],
        value: {throws: false, result: 12},
      }],
    },
  },
  {
    description: 'NaN can be used as expected result',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 44, text: '> double()'},
        ],
        value: {throws: false, result: NaN},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 45, text: 'NaN'},
        ],
        value: {throws: false, result: NaN},
      }],
    },
  },
  {
    description: 'function accessible after declaration',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 52, text: '> double.call(null, 2)'},
        ],
        value: {throws: false, result: 4},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 53, text: '4'},
        ],
        value: {throws: false, result: 4},
      }],
    },
  },
  {
    description: 'multiline input',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 62, text: '> [1,2,3,'},
          {number: 63, text: '.  4,5,6,'},
          {number: 64, text: '.  7,8,9]'},
        ],
        value: {throws: false, result: [1, 2, 3, 4, 5, 6, 7, 8, 9]},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 65, text: '[1,2,3,4,5,6,7,8,9]'},
        ],
        value: {throws: false, result: [1, 2, 3, 4, 5, 6, 7, 8, 9]},
      }],
    },
  },
  {
    description: 'multiline assignment',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 70, text: '> string'},
        ],
        value: {throws: false, result: 'input may span many lines'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 71, text: '"input may span many lines"'},
        ],
        value: {throws: false, result: 'input may span many lines'},
      }],
    },
  },
  {
    description: "spaces following '//' and '>' are optional",
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 74, text: '>"no spaces"'},
        ],
        value: {throws: false, result: 'no spaces'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 75, text: '"no spaces"'},
        ],
        value: {throws: false, result: 'no spaces'},
      }],
    },
  },
  {
    description: 'indented doctest',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 77, text: '> "Docco-compatible whitespace"'},
        ],
        value: {throws: false, result: 'Docco-compatible whitespace'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 78, text: '"Docco-compatible whitespace"'},
        ],
        value: {throws: false, result: 'Docco-compatible whitespace'},
      }],
    },
  },
  {
    description: "'>' in doctest",
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 80, text: '> 2 > 1'},
        ],
        value: {throws: false, result: true},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 81, text: 'true'},
        ],
        value: {throws: false, result: true},
      }],
    },
  },
  {
    description: 'comment on input line',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 84, text: '> "foo" + "bar" # comment'},
        ],
        value: {throws: false, result: 'foobar'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 85, text: '"foobar"'},
        ],
        value: {throws: false, result: 'foobar'},
      }],
    },
  },
  {
    description: 'comment on output line',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 87, text: '> 5 * 5'},
        ],
        value: {throws: false, result: 25},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 88, text: '25 # comment'},
        ],
        value: {throws: false, result: 25},
      }],
    },
  },
  {
    description: 'variable in creation context is not accessible',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 91, text: '> typeof Z'},
        ],
        value: {throws: false, result: 'undefined'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 92, text: '"undefined"'},
        ],
        value: {throws: false, result: 'undefined'},
      }],
    },
  },
  {
    description: "'.' should not follow leading '.' in multiline expressions",
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 95, text: '>10 -'},
          {number: 96, text: '..5'},
        ],
        value: {throws: false, result: 5},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 97, text: '9.5'},
        ],
        value: {throws: false, result: 9.5},
      }],
    },
  },
  {
    description: "wrapped lines may begin with more than one '.'",
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 100, text: '> 1000 +'},
          {number: 101, text: '.. 200 +'},
          {number: 102, text: '... 30 +'},
          {number: 103, text: '.... 4 +'},
          {number: 104, text: '..... .5'},
        ],
        value: {throws: false, result: 1234.5},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 105, text: '1234.5'},
        ],
        value: {throws: false, result: 1234.5},
      }],
    },
  },
  {
    description: 'multiline comment',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 109, text: '> 3 ** 3 - 2 ** 2'},
        ],
        value: {throws: false, result: 23},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 110, text: '23'},
        ],
        value: {throws: false, result: 23},
      }],
    },
  },
  {
    description: 'multiline comment with wrapped input',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 115, text: '> (["foo", "bar", "baz"]'},
          {number: 116, text: '.  .slice(0, -1)'},
          {number: 117, text: '.  .join(" ")'},
          {number: 118, text: '.  .toUpperCase())'},
        ],
        value: {throws: false, result: 'FOO BAR'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 119, text: '"FOO BAR"'},
        ],
        value: {throws: false, result: 'FOO BAR'},
      }],
    },
  },
  {
    description: 'multiline comment with leading asterisks',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 124, text: '> 1 + 2 * 3 * 4'},
        ],
        value: {throws: false, result: 25},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 125, text: '25'},
        ],
        value: {throws: false, result: 25},
      }],
    },
  },
  {
    description: 'multiline comment with leading asterisks',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 126, text: '> 1 * 2 + 3 + 4 * 5'},
        ],
        value: {throws: false, result: 25},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 127, text: '25'},
        ],
        value: {throws: false, result: 25},
      }],
    },
  },
  {
    description: 'multiline comment with leading asterisks and wrapped input',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 132, text: '> (fib = (n) -> switch n'},
          {number: 133, text: '.    when 0, 1 then n'},
          {number: 134, text: '.    else fib(n - 2) + fib(n - 1)) 10'},
        ],
        value: {throws: false, result: 55},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 135, text: '55'},
        ],
        value: {throws: false, result: 55},
      }],
    },
  },
  {
    description: 'multiline output',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 139, text: '> ["foo", "bar", "baz"]'},
        ],
        value: {throws: false, result: ['foo', 'bar', 'baz']},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 140, text: '[ "foo"'},
          {number: 141, text: '. "bar"'},
          {number: 142, text: '. "baz" ]'},
        ],
        value: {throws: false, result: ['foo', 'bar', 'baz']},
      }],
    },
  },
  {
    description: 'multiline input with multiline output',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 145, text: '> ["foo", "bar", "baz"]'},
          {number: 146, text: '. .join(",")'},
          {number: 147, text: '. .toUpperCase()'},
          {number: 148, text: '. .split(",")'},
        ],
        value: {throws: false, result: ['FOO', 'BAR', 'BAZ']},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 149, text: '[ "FOO"'},
          {number: 150, text: '. "BAR"'},
          {number: 151, text: '. "BAZ"'},
          {number: 152, text: '. "XXX" ]'},
        ],
        value: {throws: false, result: ['FOO', 'BAR', 'BAZ', 'XXX']},
      }],
    },
  },
];
