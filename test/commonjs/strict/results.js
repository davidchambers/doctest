export default [
  {
    description: "preserves 'use strict' directive",
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 3, text: '> (function() { return this; }())'},
        ],
        value: {throws: false, result: undefined},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 4, text: 'undefined'},
        ],
        value: {throws: false, result: undefined},
      }],
    },
  },
];
