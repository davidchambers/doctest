import show from 'sanctuary-show';

import {comparison} from './Comparison.js';
import {effect} from './Effect.js';
import doctest from './doctest.js';
import program from './program.js';


//    formatEffect :: Effect -> String
const formatEffect = (
  effect (x => `! ${x}`)
         (show)
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

    const messages = output.map (test =>
      comparison (actual => expected => [
                    `FAIL: expected ${
                      formatEffect (expected)
                    } on line ${
                      test.lines.output[0].number
                    } (got ${
                      formatEffect (actual)
                    })\n`,
                  ])
                 (_ => [])
                 (test.comparison)
    );
    const failures = messages.flat ();

    if (!program.silent) {
      process.stdout.write (`running doctests in ${path}...
${(messages.map (m => m.length === 0 ? '.' : 'x')).join ('')}
${failures.join ('')}`);
    }

    process.exit (failures.length > 0 ? 1 : 0);
  }
}) ();
