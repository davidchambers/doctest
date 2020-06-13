export default [
  {
    description: 'object spread syntax',
    doctest: {
      correct: true,
      input: {
        lines: [
          {number: 1, text: '> {x: 0, ...{x: 1, y: 2, z: 3}, z: 4}'},
        ],
        throws: false,
        result: {x: 1, y: 2, z: 4},
      },
      output: {
        lines: [
          {number: 2, text: '{x: 1, y: 2, z: 4}'},
        ],
        throws: false,
        result: {x: 1, y: 2, z: 4},
      },
    },
  },
];
