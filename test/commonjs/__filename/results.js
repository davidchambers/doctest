export default [
  {
    description: '__filename is defined',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 3, text: '> typeof __filename'},
        ],
        value: {throws: false, result: 'string'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 4, text: "'string'"},
        ],
        value: {throws: false, result: 'string'},
      }],
    },
  },
  {
    description: '__filename is absolute',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 8, text: '> path.isAbsolute (__filename)'},
        ],
        value: {throws: false, result: true},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 9, text: 'true'},
        ],
        value: {throws: false, result: true},
      }],
    },
  },
  {
    description: '__filename is correct',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 11, text: '> path.relative (process.cwd (), __filename)'},
        ],
        value: {throws: false, result: 'test/commonjs/__filename/index.js'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 12, text: "'test/commonjs/__filename/index.js'"},
        ],
        value: {throws: false, result: 'test/commonjs/__filename/index.js'},
      }],
    },
  },
];
