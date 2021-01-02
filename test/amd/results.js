export default [
  {
    description: 'doctest in AMD module',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 4, text: '> toFahrenheit(0)'},
        ],
        value: {throws: false, result: 32},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 5, text: '32'},
        ],
        value: {throws: false, result: 32},
      }],
    },
  },
];
