import fs from 'fs';
import {resolve} from 'path';
import {promisify} from 'util';

import doctest from './doctest.js';


const wrap = source => `
export const __doctest = {
  queue: [],
  enqueue: function(io) { this.queue.push(io); },
};

${source}
`;

const evaluate = (source, path) => {
  const abspath = resolve (path)
                  .replace (/[.][^.]+$/, `-${Date.now ()}.mjs`);

  const cleanup = f => x =>
    promisify (fs.unlink) (abspath)
    .then (() => f (x));

  return promisify (fs.writeFile) (abspath, source)
    .then (() => import (abspath))
    .then (module => doctest.run (module.__doctest.queue))
    .then (cleanup (Promise.resolve.bind (Promise)),
           cleanup (Promise.reject.bind (Promise)));
};

export default options => async path => {
  if (options.module !== 'esm') return doctest (options) (path);

  const {
    prefix = '',
    openingDelimiter,
    closingDelimiter,
    print,
    silent,
    type,
  } = options;

  if (type != null) {
    throw new Error ('Cannot use file type when module is "esm"');
  }

  const source = wrap (
    doctest.rewrite$js ({prefix,
                         openingDelimiter,
                         closingDelimiter,
                         sourceType: 'module'})
                       ((await promisify (fs.readFile) (path, 'utf8'))
                        .replace (/\r\n?/g, '\n')
                        .replace (/^#!.*/, ''))
  );

  if (print) {
    console.log (source.replace (/\n$/, ''));
    return [];
  } else if (silent) {
    return evaluate (source, path);
  } else {
    console.log (`running doctests in ${path}...`);
    return evaluate (source, path)
      .then (results => ((doctest.log (results), results)));
  }
};
