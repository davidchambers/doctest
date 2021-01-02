import Absolute from './index.js';

export default [
  {
    description: 'uses Z.equals for equality checks',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 1, text: '> Absolute(-1)'},
        ],
        value: {throws: false, result: Absolute (-1)},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 2, text: 'Absolute(1)'},
        ],
        value: {throws: false, result: Absolute (1)},
      }],
    },
  },
];
