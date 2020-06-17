import doctest from './doctest.mjs';
import program from './program.js';


//  formatErrors :: Array String -> String
function formatErrors(errors) {
  return (errors.map (function(s) { return 'error: ' + s + '\n'; })).join ('');
}

if (program.args.length === 0) {
  process.stderr.write (formatErrors (['No files for doctesting provided']));
  process.exit (1);
}

Promise.all (program.args.map (function(path) {
  return (doctest (path, program)).then (function(results) {
    return results.reduce (function(status, tuple) {
      return tuple[0] ? status : 1;
    }, 0);
  });
})).then (function(statuses) {
  process.exit (statuses.every (function(s) { return s === 0; }) ? 0 : 1);
}, function(err) {
  process.stderr.write (formatErrors ([err.message]));
  process.exit (1);
});
