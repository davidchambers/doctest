import show from 'sanctuary-show';

import {comparison} from './Comparison.js';
import {effect} from './Effect.js';
import doctest from './doctest.js';
import program from './program.js';


const bold   = text => '\u001B[1m'  + text + '\u001B[22m';
const invert = text => '\u001B[7m'  + text + '\u001B[0m';
const blue   = text => '\u001B[34m' + text + '\u001B[0m';
const purple = text => '\u001B[35m' + text + '\u001B[0m';

//    formatLine :: (String -> String) -> Array Line -> String
const formatLine = colour => line => `${
  invert (` ${`${line.number}`.padStart (4)} `)
} ${
  colour (line.text)
}`;

//    formatEffect :: Effect -> String
const formatEffect = (
  effect (e => `${bold ('throw')} ${show (e)}`)
         (output =>
            output.channel == null
            ? show (output.value)
            : `${bold (output.channel)} (${show (output.value)})`)
);

(async () => {
  for (const path of program.args) {
    let output;
    try {
      output = await doctest (program) (path);
    } catch (err) {
      process.stderr.write (`${err}\n`);
      process.exit (1);
    }

    if (program.print) {
      process.stdout.write (output);
      process.exit (0);
    }

    const failures = output.flatMap (test =>
      comparison (actual => expected => [
                    [[''],
                     test.lines.input.map (formatLine (blue)),
                     test.lines.output.map (formatLine (purple)),
                     [''],
                     actual.map (a => blue (formatEffect (a))),
                     expected.map (e => purple (formatEffect (e))),
                     ['']]
                    .flat ()
                    .join ('\n'),
                  ])
                 (_ => [])
                 (test.comparison)
    );

    if (!program.silent) {
      process.stdout.write (`
Running doctests in ${bold (path)}...
${failures.join ('')}
`);
    }

    process.exit (failures.length > 0 ? 1 : 0);
  }
}) ();
