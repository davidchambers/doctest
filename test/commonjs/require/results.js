export default [
  {
    description: 'require another CommonJS module',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 1, text: '> typeof $require("assert")'},
        ],
        value: {throws: false, result: 'function'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 2, text: '"function"'},
        ],
        value: {throws: false, result: 'function'},
      }],
    },
  },
];
