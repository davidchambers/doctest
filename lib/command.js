import doctest from './doctest.js';
import program from './program.js';


Promise.all (
  program.args.map (path =>
    doctest (program) (path)
    .then (results =>
      results.reduce ((status, [correct]) => correct ? status : 1, 0)
    )
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
