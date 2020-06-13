export default [
  {
    description: '__dirname is defined',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 3, text: '> typeof __dirname'},
        ],
        throws: false,
        result: 'string',
      },
      output: {
        lines: [
          {number: 4, text: "'string'"},
        ],
        throws: false,
        result: 'string',
      },
    },
  },
];
