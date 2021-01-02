export default [
  {
    description: 'accepts Transcribe-style prefix',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 5, text: '> toFahrenheit (0)'},
        ],
        value: {throws: false, result: 32},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 6, text: '32'},
        ],
        value: {throws: false, result: 32},
      }],
    },
  },
];
