export default [
  {
    description: 'var',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 5, text: '> Math.sqrt(x)'},
        ],
        throws: false,
        result: 8,
      },
      output: {
        lines: [
          {number: 6, text: '8'},
        ],
        throws: false,
        result: 8,
      },
    },
  },
  {
    description: 'let',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 10, text: '> Math.abs(y)'},
        ],
        throws: false,
        result: 1,
      },
      output: {
        lines: [
          {number: 11, text: '1'},
        ],
        throws: false,
        result: 1,
      },
    },
  },
  {
    description: 'function declaration',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 15, text: '> fib(10)'},
        ],
        throws: false,
        result: 55,
      },
      output: {
        lines: [
          {number: 16, text: '55'},
        ],
        throws: false,
        result: 55,
      },
    },
  },
];
