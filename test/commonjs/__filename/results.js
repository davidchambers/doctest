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
  {
    description: '__filename is absolute',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 8, text: '> path.isAbsolute (__filename)'},
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
    description: '__filename is correct',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 11, text: '> path.relative (process.cwd (), __filename)'},
        ],
        throws: false,
        result: 'test/commonjs/__filename/index.js',
      },
      output: {
        lines: [
          {number: 12, text: "'test/commonjs/__filename/index.js'"},
        ],
        throws: false,
        result: 'test/commonjs/__filename/index.js',
      },
    },
  },
];
