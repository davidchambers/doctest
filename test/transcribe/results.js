export default [
  {
    description: 'accepts Transcribe-style prefix',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 11, text: '> map(Math.sqrt)([1, 4, 9])'},
        ],
        throws: false,
        result: [1, 2, 3],
      },
      output: {
        lines: [
          {number: 12, text: '[1, 2, 3]'},
        ],
        throws: false,
        result: [1, 2, 3],
      },
    },
  },
];
