export default [
  {
    description: 'correct line number reported irrespective of line endings',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 1, text: '> 2 * 3 * 7'},
        ],
        value: {throws: false, result: 42},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 2, text: '42'},
        ],
        value: {throws: false, result: 42},
      }],
    },
  },
];
