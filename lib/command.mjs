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

program.args.reduce (function(promise, path) {
  return promise.then (function(ok) {
    return (doctest (path, program)).then (function(results) {
      return ok && results.every (function(t) { return t[0]; });
    });
  });
}, Promise.resolve (true))
.then (function(ok) {
  process.exit (ok ? 0 : 1);
}, function(err) {
  process.stderr.write (formatErrors ([err.message]));
  process.exit (1);
});
