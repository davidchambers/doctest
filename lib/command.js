import show from 'sanctuary-show';

import doctest from './doctest.js';
import program from './program.js';


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
        value.forEach (({correct, input, output}) => {
          if (!correct) {
            const actual = input.throws ?
                           `! ${input.exception}` :
                           show (input.result);
            const start = output.lines[0].number;
            const end = output.lines[output.lines.length - 1].number;
            process.stdout.write (`
Unexpected result on ${
  end === start ? `line ${start}` : `lines ${start}-${end}`
}:

${input.lines
  .map (line => line.text.replace (/^[ ]*/, ''))
  .join ('\n')}
\u001B[0;32m${
  output.lines
  .map (line => line.text.replace (/^[ ]*/, ''))
  .join ('\n')}\u001B[0m
\u001B[0;31m${actual}\u001B[0m
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
