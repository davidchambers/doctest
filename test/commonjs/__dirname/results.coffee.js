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
  {
    description: '__dirname is absolute',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 8, text: '> path.isAbsolute __dirname'},
        ],
        throws: false,
        result: true,
      },
      output: {
        lines: [
          {number: 9, text: 'true'},
        ],
        throws: false,
        result: true,
      },
    },
  },
  {
    description: '__dirname is correct',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 11, text: '> path.relative process.cwd(), __dirname'},
        ],
        throws: false,
        result: 'test/commonjs/__dirname',
      },
      output: {
        lines: [
          {number: 12, text: "'test/commonjs/__dirname'"},
        ],
        throws: false,
        result: 'test/commonjs/__dirname',
      },
    },
  },
];
