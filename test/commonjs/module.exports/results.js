export default [
  {
    description: 'module.exports',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 1, text: '> module.exports(42)'},
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
