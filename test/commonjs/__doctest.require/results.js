export default [
  {
    description: '__doctest.require',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 5, text: "> (new url.URL ('https://sanctuary.js.org/')).hostname"},
        ],
        value: {throws: false, result: 'sanctuary.js.org'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 6, text: "'sanctuary.js.org'"},
        ],
        value: {throws: false, result: 'sanctuary.js.org'},
      }],
    },
  },
];
