export default [
  {
    description: 'doctest in AMD module',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 4, text: '> toFahrenheit(0)'},
        ],
        throws: false,
        result: 32,
      },
      output: {
        lines: [
          {number: 5, text: '32'},
        ],
        throws: false,
        result: 32,
      },
    },
  },
];
