import show from 'sanctuary-show';

import doctest from './doctest.js';
import program from './program.js';

const maybe = x => f => xs => xs.length === 0 ? x : f (xs[0]);

const assertion = f => g => h => x => ({
  expected: d => f (d.expected),
  actual: d => g (d.actual),
  both: d => h (d.actual) (d.expected),
}[x.tag](x));

const result = f => g => x => x.throws ? f (x.exception) : g (x.result);

const showExecutionValue = execution => (
  execution.throws ? `! ${execution.exception}` : show (execution.result)
);

const showLines = lines => (
  lines
    .map (line => line.text.replace (/^[ ]*/, ''))
    .join ('\n')
);

const showTestLines = test => showLines (test.lines);

const equalAssertions = (a, b) => (
  expected.channel === actual.channel &&
  expected.value.throws === actual.value.throws &&
  expected.value.throws
  ? exceptionEq (actual.value.exception, expected.value.exception)
  : Z.equals (actual.value.result, expected.value.result)
);


// data Tagged a = Tagged String a
// data Result a b = Success a | Failure b
// type Assertion a b = Tagged (Result a b)

// expected :: Assertion

// type Channel = String
// data AssertionResult a b e e2 = Success Channel (Result a e)
//                               | ChannelMissmatch Channel Channel (Result a e) (Result b e2)
//                               | ValueMissmatch Channel (Result a e) (Result b e2)


// untag :: Tagged a -> Tagged b -> Maybe (Pair a b)
// unresult :: Result a b -> Result c d -> Either (Pair a c) (Pair b d)


// if (expected.length === 0) {
//   const it = actual[0];
//   const message = `unexpected ${actual.} on ${actual.channel}: ${show ()}`
// }

// if (actual.length === 0) {
  
// }

// if (expected.channel !== actual.channel) {
  
// }

// const failure = assertions.find (({correct}) => !correct);
// if (failure == null) {
//   return;
// }

// const {actual, expected} = failure;
// const lineRepr = maybe ('an unknown line') (e => {
//   const start = e.lines[0].number;
//   const end = e.lines[e.lines.length - 1].number;
//   return end === start ? `line ${start}` : `lines ${start}-${end}`;
// }) (expected);

// const inputCodeRepr = maybe ('no input')
//                             (showLines)
//                             (actual);

// const outputCodeRepr = maybe ('<expected nothing>')
//                               (showLines)
//                               (expected);

// const actualRepr = maybe ('<got nothing>')
//                           (showExecutionValue)
//                           (actual.map (test => test.value));

const showLineNumbers = lines => {
  const start = lines[0].number;
  const end = lines[lines.length - 1].number;
  return end === start ? `line ${start}` : `lines ${start}-${end}`;
};

const messageForExpected = isAsync => ({channel, value, lines}) => (
  `expected ${
    result (_ => 'an exception') (_ => 'a value') (value)
  } ${
    channel == null ?
    result (_ => 'to be thrown') (_ => 'to be returned') (value) :
    `on ${channel}, but none was produced ${isAsync ? 'in time' : ''}`
  } (${
    showLineNumbers (lines)
  }):\n\n${showLines (lines)}\n`
);

const messageForActual = ({channel, value, lines}) => channel === null ? '' : (
  `unexpected ${
    result (_ => 'exception') (_ => 'value') (value)
  } on ${
    channel
  }:\n\n${
    showExecutionValue (value)
  }\n`
);

// TODO: messageForBoth
// `Unexpected result on ${lineRepr}:
// ${inputCodeRepr}
// \u001B[0;32m${outputCodeRepr}\u001B[0m
// \u001B[0;31m${actualRepr}\u001B[0m
// `
const messageForBoth = actual => expected => 'both\n\n'


const messageForAssertion = isAsync => assertion (messageForExpected (isAsync))
                                                 (messageForActual)
                                                 (messageForBoth);

const isReturnValue = ({channel}) => channel == null;

Promise.all (
  program.args.map (
    path => (doctest (program) (path)).then (value => ({path, value}))
  )
)
.then (
  results => {
    if (program.print) {
      results.forEach (({value: code}) => { process.stdout.write (code); });
      process.exit (0);
    }

    if (!program.silent) {
      results.forEach (({path, value: tests}) => {
        process.stdout.write (`running doctests in ${path}...\n`);
        // TODO: Incorporate into the next forEach using a maybe type
        // tests.forEach (assertions => {
        //   process.stdout.write (
        //     assertions.every (({correct}) => correct) ? '.' : 'x'
        //   );
        // });
        process.stdout.write ('\n');
        tests
        .forEach (assertions => {
          assertions
          .reduce (({isAsync, messages}, x) => ({
            isAsync: (
              isAsync ||
              assertion (_ => false) (isReturnValue) (_ => isReturnValue) (x)
            ),
            messages: messages.concat ([messageForAssertion (isAsync) (x)])
          }), {isAsync: false, messages: []})
          .messages
          .forEach (x => process.stdout.write (x));
        });
        process.stdout.write ('\n');
      });
    }

    process.exit (
      results.reduce (
        (status, {value}) =>
          value.reduce (
            (status, {correct}) => correct ? status : 1,
            status
          ),
        0
      )
    );
  },
  err => {
    // console.log(err.stack);
    process.stderr.write (`${err}\n`);
    process.exit (2);
  }
);
