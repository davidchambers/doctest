export default [
  {
    description: '__filename is defined',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 3, text: '> typeof __filename'},
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
