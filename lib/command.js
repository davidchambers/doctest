import show from 'sanctuary-show';

import doctest from './doctest.js';
import program from './program.js';

const maybe = x => f => xs => xs.length === 0 ? x : f (xs[0]);

const representExecutionValue = execution => (
  execution.throws ? `! ${execution.exception}` : show (execution.result)
);

const representTestLines = test => (
  test.lines
    .map (line => line.text.replace (/^[ ]*/, ''))
    .join ('\n')
);

Promise.all (
  program.args.map (
    path => (doctest (program) (path)).then (value => ({path, value}))
  )
)
.then (
  results => {
    if (program.print) {
      results.forEach (({value}) => { process.stdout.write (value); });
      process.exit (0);
    }

    if (!program.silent) {
      results.forEach (({path, value}) => {
        process.stdout.write (`running doctests in ${path}...\n`);
        value.forEach (({correct}) => {
          process.stdout.write (correct ? '.' : 'x');
        });
        process.stdout.write ('\n');
        value.forEach (({correct, actual, expected}) => {
          if (!correct) {
            const lineRepr = maybe ('an unknown line') (e => {
              const start = e.lines[0].number;
              const end = e.lines[e.lines.length - 1].number;
              return end === start ? `line ${start}` : `lines ${start}-${end}`;
            }) (expected);

            const inputCodeRepr = maybe ('no input')
                                        (representTestLines)
                                        (actual);

            const outputCodeRepr = maybe ('<expected nothing>')
                                         (representTestLines)
                                         (expected);

            const actualRepr = maybe ('<got nothing>')
                                     (representExecutionValue)
                                     (actual.map (test => test.value));

            process.stdout.write (`
Unexpected result on ${lineRepr}:

${inputCodeRepr}
\u001B[0;32m${outputCodeRepr}\u001B[0m
\u001B[0;31m${actualRepr}\u001B[0m
`);
          }
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
    process.stderr.write (`${err}\n`);
    process.exit (1);
  }
);
