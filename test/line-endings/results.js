export default [
  {
    description: 'correct line number reported irrespective of line endings',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 1, text: '> 2 * 3 * 7'},
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
