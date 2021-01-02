export default [
  {
    description: 'accepts Transcribe-style prefix',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 11, text: '> map(Math.sqrt)([1, 4, 9])'},
        ],
        value: {throws: false, result: [1, 2, 3]},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 12, text: '[1, 2, 3]'},
        ],
        value: {throws: false, result: [1, 2, 3]},
      }],
    },
  },
];
