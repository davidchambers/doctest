export default [
  {
    description: 'output line immediately following input line',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 15, text: '> zero (42)'},
        ],
        value: {throws: false, result: 0},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 16, text: '0'},
        ],
        value: {throws: false, result: 0},
      }],
    },
  },
];
