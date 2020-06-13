export default [
  {
    description: '__doctest.require',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 5, text: "> (new url.URL ('https://sanctuary.js.org/')).hostname"},
        ],
        throws: false,
        result: 'sanctuary.js.org',
      },
      output: {
        lines: [
          {number: 6, text: "'sanctuary.js.org'"},
        ],
        throws: false,
        result: 'sanctuary.js.org',
      },
    },
  },
];
