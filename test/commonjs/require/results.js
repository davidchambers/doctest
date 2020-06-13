export default [
  {
    description: 'require another CommonJS module',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 1, text: '> typeof $require("assert")'},
        ],
        throws: false,
        result: 'function',
      },
      output: {
        lines: [
          {number: 2, text: '"function"'},
        ],
        throws: false,
        result: 'function',
      },
    },
  },
];
