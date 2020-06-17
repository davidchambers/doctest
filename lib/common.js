'use strict';


//  sanitizeFileContents :: String -> String
exports.sanitizeFileContents = function(contents) {
  return contents.replace (/\r\n?/g, '\n').replace (/^#!.*/, '');
};

//  unlines :: Array String -> String
exports.unlines = function(lines) {
  return lines.reduce (function(s, line) { return s + line + '\n'; }, '');
};
