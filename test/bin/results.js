export default [
  {
    description: 'executable without file extension',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 3, text: '> identity(42)'},
        ],
        throws: false,
        result: 42,
      },
      output: {
        lines: [
          {number: 4, text: '42'},
        ],
        throws: false,
        result: 42,
      },
    },
  },
];
