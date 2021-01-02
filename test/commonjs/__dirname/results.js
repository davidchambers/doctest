export default [
  {
    description: '__dirname is defined',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 3, text: '> typeof __dirname'},
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
    description: '__dirname is absolute',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 8, text: '> path.isAbsolute (__dirname)'},
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
    description: '__dirname is correct',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 11, text: '> path.relative (process.cwd (), __dirname)'},
        ],
        value: {throws: false, result: 'test/commonjs/__dirname'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 12, text: "'test/commonjs/__dirname'"},
        ],
        value: {throws: false, result: 'test/commonjs/__dirname'},
      }],
    },
  },
];
