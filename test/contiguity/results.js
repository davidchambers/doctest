export default [
  {
    description: 'output line immediately following input line',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 15, text: '> zero (42)'},
        ],
        throws: false,
        result: 0,
      },
      output: {
        lines: [
          {number: 16, text: '0'},
        ],
        throws: false,
        result: 0,
      },
    },
  },
];
