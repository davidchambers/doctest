import {comparison} from './Comparison.js';
import doctest from './doctest.js';
import program from './program.js';


Promise.all (
  program.args.map (path =>
    doctest (program) (path)
    .then (tests => tests.reduce (
      (status, test) => comparison (_ => _ => 1)
                                   (_ => status)
                                   (test.comparison),
      0
    ))
  )
)
.then (
  statuses => {
    process.exit (statuses.every (s => s === 0) ? 0 : 1);
  },
  err => {
    process.stderr.write (`${err}\n`);
    process.exit (1);
  }
);
