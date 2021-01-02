export default [
  {
    description: 'executable without file extension',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 3, text: '> identity(42)'},
        ],
        value: {throws: false, result: 42},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 4, text: '42'},
        ],
        value: {throws: false, result: 42},
      }],
    },
  },
];
