import fs from 'fs';
import pathlib from 'path';
import util from 'util';

import common from './common.js';
import doctest from './doctest.js';


export default async function(path, options) {
  if (options.module !== 'esm') return doctest (path, options);

  if (options.type != null) {
    throw new Error ('Cannot use file type when module is "esm"');
  }

  const source = wrap (
    doctest.rewrite$js (
      {prefix: options.prefix == null ? '' : options.prefix,
       openingDelimiter: options.openingDelimiter,
       closingDelimiter: options.closingDelimiter,
       logFunctionNames: options.logFunction,
       sourceType: 'module'},
      common.sanitizeFileContents (
        await util.promisify (fs.readFile) (path, 'utf8')
      )
    )
  );

  if (options.print) {
    console.log (source.replace (/\n$/, ''));
    return [];
  } else if (options.silent) {
    return evaluate (options, source, path);
  } else {
    console.log ('running doctests in ' + path + '...');
    return (evaluate (options, source, path)).then (function(results) {
      doctest.log (results);
      return results;
    });
  }
}

function wrap(source) {
  return common.unlines ([
    'export const __doctest = {',
    '  queue: [],',
    '  enqueue: function(io) { this.queue.push(io); }',
    '};',
    '',
    source
  ]);
}

function evaluate(options, source, path) {
  const abspath =
  (pathlib.resolve (path)).replace (/[.][^.]+$/, '-' + Date.now () + '.mjs');

  function cleanup(f) {
    return function(x) {
      return (util.promisify (fs.unlink) (abspath)).then (function() {
        return f (x);
      });
    };
  }

  return (util.promisify (fs.writeFile) (abspath, source))
    .then (function() { return import (abspath); })
    .then (function(module) {
      return doctest.run (options, module.__doctest.queue);
    })
    .then (cleanup (Promise.resolve.bind (Promise)),
           cleanup (Promise.reject.bind (Promise)));
}
