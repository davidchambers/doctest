import doctest from './doctest.mjs';
import program from './program.js';


//    formatErrors :: Array String -> String
const formatErrors = errors => (errors.map (s => `error: ${s}\n`)).join ('');

if (program.args.length === 0) {
  process.stderr.write (formatErrors (['No files for doctesting provided']));
  process.exit (1);
}

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
    process.stderr.write (formatErrors ([err.message]));
    process.exit (1);
  }
);
