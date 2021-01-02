export default [
  {
    description: 'input evaluates to Error with expected message',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 2, text: "> new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 3, text: "new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
    },
  },
  {
    description: 'input evaluates to Error without expected message',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 5, text: '> new Error()'},
        ],
        value: {throws: false, result: new Error ()},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 6, text: "new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
    },
  },
  {
    description: 'input evaluates to Error with unexpected message',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 8, text: "> new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 9, text: 'new Error()'},
        ],
        value: {throws: false, result: new Error ()},
      }],
    },
  },
  {
    description: 'input evaluates to Error with unexpected message',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 11, text: "> new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 12, text: "new Error('XXX')"},
        ],
        value: {throws: false, result: new Error ('XXX')},
      }],
    },
  },
  {
    description: 'evaluating input does not throw expected exception',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 14, text: "> new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 15, text: '! Error: Invalid value'},
        ],
        value: {throws: true, exception: new Error ('Invalid value')},
      }],
    },
  },
  {
    description: 'evaluating input throws unexpected exception',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 17, text: '> sqrt(-1)'},
        ],
        value: {throws: true, exception: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 18, text: "new Error('Invalid value')"},
        ],
        value: {throws: false, result: new Error ('Invalid value')},
      }],
    },
  },
  {
    description: 'evaluating input throws exception as expected, of expected type',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 20, text: '> null.length'},
        ],
        value: {throws: true, exception: new TypeError ("Cannot read property 'length' of null")},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 21, text: '! TypeError'},
        ],
        value: {throws: true, exception: new TypeError ()},
      }],
    },
  },
  {
    description: 'evaluating input throws exception as expected, of unexpected type',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 23, text: '> null.length'},
        ],
        value: {throws: true, exception: new TypeError ("Cannot read property 'length' of null")},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 24, text: '! Error'},
        ],
        value: {throws: true, exception: new Error ()},
      }],
    },
  },
  {
    description: 'evaluating input throws exception as expected, with expected message',
    doctest: {
      correct: true,
      actual: [{
        channel: null,
        lines: [
          {number: 26, text: '> sqrt(-1)'},
        ],
        value: {throws: true, exception: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 27, text: '! Error: Invalid value'},
        ],
        value: {throws: true, exception: new Error ('Invalid value')},
      }],
    },
  },
  {
    description: 'evaluating input throws exception as expected, with unexpected message',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 29, text: '> sqrt(-1)'},
        ],
        value: {throws: true, exception: new Error ('Invalid value')},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 30, text: '! Error: XXX'},
        ],
        value: {throws: true, exception: new Error ('XXX')},
      }],
    },
  },
  {
    description: 'evaluating output throws unexpected exception',
    doctest: {
      correct: false,
      actual: [{
        channel: null,
        lines: [
          {number: 32, text: "> 'foo' + 'bar'"},
        ],
        value: {throws: false, result: 'foobar'},
      }],
      expected: [{
        channel: null,
        lines: [
          {number: 33, text: 'foobar'},
        ],
        value: {throws: true, exception: new ReferenceError ('foobar is not defined')},
      }],
    },
  },
];
