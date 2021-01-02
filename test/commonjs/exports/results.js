export default [
  {
    description: 'exports',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 1, text: '> exports.identity(42)'},
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
