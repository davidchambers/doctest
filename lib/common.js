'use strict';


//  formatErrors :: Array String -> String
exports.formatErrors = function(errors) {
  return (errors.map (function(s) { return 'error: ' + s + '\n'; })).join ('');
};

//  sanitizeFileContents :: String -> String
exports.sanitizeFileContents = function(contents) {
  return contents.replace (/\r\n?/g, '\n').replace (/^#!.*/, '');
};

//  unlines :: Array String -> String
exports.unlines = function(lines) {
  return lines.reduce (function(s, line) { return s + line + '\n'; }, '');
};

exports.runDoctests = function(doctest, program) {
  if (program.args.length === 0) {
    process.stderr.write (exports.formatErrors ([
      'No files for doctesting provided'
    ]));
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
    process.stderr.write (exports.formatErrors ([err.message]));
    process.exit (1);
  });
};
