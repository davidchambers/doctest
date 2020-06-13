export default [
  {
    description: 'exports',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 1, text: '> exports.identity(42)'},
        ],
        throws: false,
        result: 42,
      },
      output: {
        lines: [
          {number: 2, text: '42'},
        ],
        throws: false,
        result: 42,
      },
    },
  },
];
