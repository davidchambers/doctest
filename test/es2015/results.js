export default [
  {
    description: 'seq.next().value',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 12, text: '> seq.next().value'},
        ],
        value: {throws: false, result: 1},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 13, text: '1'},
        ],
        value: {throws: false, result: 1},
      }],
    },
  },
  {
    description: 'seq.next().value',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 14, text: '> seq.next().value'},
        ],
        value: {throws: false, result: 1},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 15, text: '1'},
        ],
        value: {throws: false, result: 1},
      }],
    },
  },
  {
    description: 'seq.next().value',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 16, text: '> seq.next().value'},
        ],
        value: {throws: false, result: 2},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 17, text: '2'},
        ],
        value: {throws: false, result: 2},
      }],
    },
  },
  {
    description: 'seq.next().value',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 18, text: '> seq.next().value'},
        ],
        value: {throws: false, result: 3},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 19, text: '3'},
        ],
        value: {throws: false, result: 3},
      }],
    },
  },
  {
    description: 'seq.next().value',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 20, text: '> seq.next().value'},
        ],
        value: {throws: false, result: 5},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 21, text: '5'},
        ],
        value: {throws: false, result: 5},
      }],
    },
  },
];
