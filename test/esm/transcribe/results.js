export default [
  {
    description: 'accepts Transcribe-style prefix',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 5, text: '> toFahrenheit (0)'},
        ],
        throws: false,
        result: 32,
      },
      output: {
        lines: [
          {number: 6, text: '32'},
        ],
        throws: false,
        result: 32,
      },
    },
  },
];
