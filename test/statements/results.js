export default [
  {
    description: 'var',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 5, text: '> Math.sqrt(x)'},
        ],
        value: {throws: false, result: 8},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 6, text: '8'},
        ],
        value: {throws: false, result: 8},
      }],
    },
  },
  {
    description: 'let',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 10, text: '> Math.abs(y)'},
        ],
        value: {throws: false, result: 1},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 11, text: '1'},
        ],
        value: {throws: false, result: 1},
      }],
    },
  },
  {
    description: 'function declaration',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 15, text: '> fib(10)'},
        ],
        value: {throws: false, result: 55},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 16, text: '55'},
        ],
        value: {throws: false, result: 55},
      }],
    },
  },
];
