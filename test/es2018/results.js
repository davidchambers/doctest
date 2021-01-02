export default [
  {
    description: 'object spread syntax',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 1, text: '> {x: 0, ...{x: 1, y: 2, z: 3}, z: 4}'},
        ],
        value: {throws: false, result: {x: 1, y: 2, z: 4}},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 2, text: '{x: 1, y: 2, z: 4}'},
        ],
        value: {throws: false, result: {x: 1, y: 2, z: 4}},
      }],
    },
  },
];
