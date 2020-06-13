import Absolute from './index.js';

export default [
  {
    description: 'uses Z.equals for equality checks',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 1, text: '> Absolute(-1)'},
        ],
        throws: false,
        result: Absolute (-1),
      },
      output: {
        lines: [
          {number: 2, text: 'Absolute(1)'},
        ],
        throws: false,
        result: Absolute (1),
      },
    },
  },
];
