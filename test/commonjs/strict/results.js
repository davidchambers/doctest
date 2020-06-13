export default [
  {
    description: "preserves 'use strict' directive",
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 3, text: '> (function() { return this; }())'},
        ],
        throws: false,
        result: undefined,
      },
      output: {
        lines: [
          {number: 4, text: 'undefined'},
        ],
        throws: false,
        result: undefined,
      },
    },
  },
];
