
///          >>>
///          >>>                        >>>                         >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
///    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
///    .....................x.......xx.x.................................

import fs from 'fs';
import {resolve} from 'path';

import * as acorn from 'acorn';
import CoffeeScript from 'coffeescript';
import _show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import require from './require.js';


//    compose :: (b -> c) -> (a -> b) -> a -> c
const compose = f => g => x => f (g (x));

//    indentN :: Integer -> String -> String
const indentN = n => s => s.replace (/^(?!$)/gm, ' '.repeat (n));

//    quote :: String -> String
const quote = s => `'${s.replace (/'/g, "\\'")}'`;

const wrapJs = sourceType => test => {
  const source = test.input.value;
  const ast = acorn.parse (
    source.startsWith ('{') && source.endsWith ('}') ? `(${source})` : source,
    {ecmaVersion: 2020, sourceType}
  );
  const {type} = ast.body[0];
  return type === 'FunctionDeclaration' ||
         type === 'ImportDeclaration' ||
         type === 'VariableDeclaration' ?
    test.input.value :
    `
__doctest.enqueue({
  type: "input",
  thunk: () => {
    return ${test.input.value};
  },
});
${test.output == null ? '' : `
__doctest.enqueue({
  type: "output",
  ":": ${test.output.loc.start.line},
  "!": ${test['!']},
  thunk: () => {
    return ${test.output.value};
  },
});
`}`;
};

const wrapCoffee = test => `
__doctest.enqueue {
  type: "input"
  thunk: ->
${indentN (4) (test.input.value)}
}
${test.output == null ? '' : `
__doctest.enqueue {
  type: "output"
  ":": ${test.output.loc.start.line}
  "!": ${test['!']}
  thunk: ->
${indentN (4) (test.output.value)}
}
`}`;

const wrapModule = source => `
export const __doctest = {
  queue: [],
  enqueue: function(io) { this.queue.push(io); },
};

${source}
`;

//    normalizeTest :: { output :: { value :: String } } -> Undefined
const normalizeTest = $test => {
  const $output = $test.output;
  if ($output != null) {
    const match = $output.value.match (/^![ ]?([^:]*)(?::[ ]?(.*))?$/);
    $test['!'] = match != null;
    if ($test['!']) {
      $output.value = `new ${match[1]}(${quote (match[2] || '')})`;
    }
  }
};

//    Location = { start :: { line :: Integer, column :: Integer }
//               ,   end :: { line :: Integer, column :: Integer } }

//    transformComments
//    :: { prefix :: String
//       , openingDelimiter :: String?
//       , closingDelimiter :: String? }
//    -> Array { type :: String, value :: String, loc :: Location }
//    -> Array { commentIndex :: Integer
//             ,            ! :: Boolean
//             ,        input :: { value :: String, loc :: Location }
//             ,       output :: { value :: String, loc :: Location } }
//
//    Returns the doctests present in the given esprima comment objects.
//
//    > transformComments
//    .   ({prefix: ''})
//    .   ([{type: 'Line',
//    .      value: ' > 6 * 7',
//    .      loc: {start: {line: 1, column: 0}, end: {line: 1, column: 10}}},
//    .     {type: 'Line',
//    .      value: ' 42',
//    .      loc: {start: {line: 2, column: 0}, end: {line: 2, column: 5}}}])
//    [{commentIndex: 1,
//    . '!': false,
//    . input: {value: '6 * 7',
//    .         loc: {start: {line: 1, column: 0},
//    .               end: {line: 1, column: 10}}},
//    . output: {value: '42',
//    .          loc: {start: {line: 2, column: 0},
//    .                end: {line: 2, column: 5}}}}]
const transformComments = ({
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => comments => {
  const result = comments.reduce (
    (accum, comment, commentIndex) =>
      comment.value.split ('\n')
      .reduce ((accum, line, idx) => {
        let uncommented, start, end;
        if (comment.type === 'Block') {
          uncommented = line.replace (/^\s*[*]?\s*/, '');
          start = end = {line: comment.loc.start.line + idx};
        } else if (comment.type === 'Line') {
          uncommented = line.replace (/^\s*/, '');
          ({start, end} = comment.loc);
        }
        if (uncommented.startsWith (prefix)) {
          const unprefixed = uncommented
                             .slice (prefix.length)
                             .replace (/^\s*/, '');
          if (accum.state === 'closed') {
            if (unprefixed === openingDelimiter) accum.state = 'open';
          } else if (unprefixed === closingDelimiter) {
            accum.state = 'closed';
          } else if (unprefixed.startsWith ('>')) {
            accum.tests.push ({
              [accum.state = 'input']: {
                value: unprefixed.replace (/^[>][ ]?/, ''),
                loc: {start, end},
              },
            });
          } else if (unprefixed.startsWith ('.')) {
            accum.tests[accum.tests.length - 1][accum.state].loc.end = end;
            accum.tests[accum.tests.length - 1][accum.state].value +=
              '\n' + unprefixed.replace (/^[.]+[ ]?/, '');
          } else if (accum.state === 'input') {
            accum.tests[accum.tests.length - 1].commentIndex = commentIndex;
            accum.tests[accum.tests.length - 1][accum.state = 'output'] = {
              value: unprefixed,
              loc: {start, end},
            };
          }
        }
        return accum;
      }, accum),
    {state: openingDelimiter == null ? 'open' : 'closed', tests: []}
  );

  const $tests = result.tests;
  $tests.forEach (normalizeTest);
  return $tests;
};

//    substring
//    :: ( String
//       , { line :: Integer, column :: Integer }
//       , { line :: Integer, column :: Integer } )
//    -> String
//
//    Returns the substring between the start and end positions.
//    Positions are specified in terms of line and column rather than index.
//    {line: 1, column: 0} represents the first character of the first line.
//
//    > substring ('hello\nworld', {line: 1, column: 3}, {line: 2, column: 2})
//    'lo\nwo'
//    > substring ('hello\nworld', {line: 1, column: 0}, {line: 1, column: 0})
//    ''
const substring = (input, start, end) => {
  const lines = input.split (/^/m);
  return (
    start.line === end.line ?
      lines[start.line - 1].slice (start.column, end.column) :
    end.line === Infinity ?
      lines[start.line - 1].slice (start.column) +
      (lines.slice (start.line)).join ('') :
    // else
      lines[start.line - 1].slice (start.column) +
      (lines.slice (start.line, end.line - 1)).join ('') +
      lines[end.line - 1].slice (0, end.column)
  );
};

const rewriteJs = sourceType => ({
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => input => {
  //  1. Locate block comments and line comments within the input text.
  //
  //  2. Create a list of comment chunks from the list of line comments
  //     located in step 1 by grouping related comments.
  //
  //  3. Create a list of code chunks from the remaining input text.
  //     Note that if there are N comment chunks there are N + 1 code
  //     chunks. A trailing empty comment enables the final code chunk
  //     to be captured:

  const bookend = {
    value: '',
    loc: {start: {line: Infinity, column: Infinity}},
  };

  //  4. Map each comment chunk in the list produced by step 2 to a
  //     string of JavaScript code derived from the chunk's doctests.
  //
  //  5. Zip the lists produced by steps 3 and 4.
  //
  //  6. Find block comments in the source code produced by step 5.
  //     (The locations of block comments located in step 1 are not
  //     applicable to the rewritten source.)
  //
  //  7. Repeat steps 3 through 5 for the list of block comments
  //     produced by step 6 (substituting "step 6" for "step 2").

  const getComments = input => {
    const comments = [];
    acorn.parse (input, {
      ecmaVersion: 2020,
      sourceType,
      locations: true,
      onComment: comments,
    });
    return comments;
  };

  const wrapCode = wrapJs (sourceType);

  //    comments :: { Block :: Array Comment, Line :: Array Comment }
  const comments = Z.reduce (
    (comments, comment) => ((comments[comment.type].push (comment), comments)),
    {Block: [], Line: []},
    getComments (input)
  );

  const options = {prefix, openingDelimiter, closingDelimiter};
  const blockTests = transformComments (options) (comments.Block);
  const lineTests = transformComments (options) (comments.Line);

  const chunks = lineTests
    .concat ([{input: bookend}])
    .reduce ((accum, test) => {
      accum.chunks.push (
        substring (input, accum.loc, test.input.loc.start)
        .replace (/[ \t]*$/, '')
      );
      accum.loc = (test.output == null ? test.input : test.output).loc.end;
      return accum;
    }, {chunks: [], loc: {line: 1, column: 0}})
    .chunks;

  //    source :: String
  const source = lineTests
    .map (wrapCode)
    .concat ([''])
    .reduce ((accum, s, idx) => `${accum}${chunks[idx]}${s}`, '');

  return getComments (source)
    .filter (comment => comment.type === 'Block')
    .concat ([bookend])
    .reduce ((accum, comment, idx) => {
      accum.chunks.push (
        substring (source, accum.loc, comment.loc.start),
        blockTests.reduce (
          (s, test) =>
            test.commentIndex === idx ? `${s}${wrapCode (test)}\n` : s,
          ''
        )
      );
      accum.loc = comment.loc.end;
      return accum;
    }, {chunks: [], loc: {line: 1, column: 0}})
    .chunks
    .join ('');
};

const rewriteCoffee = ({
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => input => {
  const lines = input.match (/^.*(?=\n)/gm);
  const chunks = lines.reduce ((accum, line, idx) => {
    const isComment = /^[ \t]*#(?!##)/.test (line);
    const current = isComment ? accum.commentChunks : accum.literalChunks;
    if (isComment === accum.isComment) {
      current[current.length - 1].lines.push (line);
    } else {
      current.push ({lines: [line], loc: {start: {line: idx + 1}}});
    }
    accum.isComment = isComment;
    return accum;
  }, {
    literalChunks: [{lines: [], loc: {start: {line: 1}}}],
    commentChunks: [],
    isComment: false,
  });

  const testChunks = chunks.commentChunks.map (commentChunk => {
    const result = commentChunk.lines.reduce ((accum, line, idx) => {
      const [, indent, uncommented] = line.match (/^([ \t]*)#[ \t]*(.*)$/);
      if (uncommented.startsWith (prefix)) {
        const unprefixed = uncommented
                           .slice (prefix.length)
                           .replace (/^\s*/, '');
        if (accum.state === 'closed') {
          if (unprefixed === openingDelimiter) accum.state = 'open';
        } else if (unprefixed === closingDelimiter) {
          accum.state = 'closed';
        } else if (unprefixed.startsWith ('>')) {
          accum.tests.push ({
            indent,
            [accum.state = 'input']: {
              value: unprefixed.replace (/^[>][ ]?/, ''),
            },
          });
        } else if (unprefixed.startsWith ('.')) {
          accum.tests[accum.tests.length - 1][accum.state].value +=
            '\n' + unprefixed.replace (/^[.]+[ ]?/, '');
        } else if (accum.state === 'input') {
          accum.tests[accum.tests.length - 1][accum.state = 'output'] = {
            value: unprefixed,
            loc: {start: {line: commentChunk.loc.start.line + idx}},
          };
        }
      }
      return accum;
    }, {state: openingDelimiter == null ? 'open' : 'closed', tests: []});

    return result.tests.map ($test => {
      normalizeTest ($test);
      return indentN ($test.indent.length) (wrapCoffee ($test));
    });
  });

  return CoffeeScript.compile (
    chunks.literalChunks.reduce (
      (s, chunk, idx) => Z.reduce (
        (s, line) => `${s}${line}\n`,
        chunk.lines.reduce ((s, line) => `${s}${line}\n`, s),
        idx < testChunks.length ? testChunks[idx] : []
      ),
      ''
    )
  );
};

//    arrowWrap :: String -> String
const arrowWrap = s => `void (() => {\n${indentN (2) (s)}})();`;

//    toModule :: String? -> String -> String
const toModule = moduleType => source => {
  switch (moduleType) {
    case 'amd':
      return `
${source}
function define(...args) {
  args[args.length - 1]();
}
`;
    case 'commonjs':
      return arrowWrap (`
const __doctest = {
  require,
  queue: [],
  enqueue: function(io) { this.queue.push(io); },
};

${arrowWrap (source)}

(module.exports || exports).__doctest = __doctest;
`);
    default:
      return source;
  }
};

//    show :: a -> String
const show = x =>
  Object.prototype.toString.call (x) === '[object Error]' ?
    String (x) :
    _show (x);

const run = queue =>
  queue.reduce ((accum, io) => {
    const {thunk} = accum;
    if (io.type === 'input') {
      if (thunk != null) thunk ();
      accum.thunk = io.thunk;
    } else if (io.type === 'output') {
      let either;
      try {
        either = {tag: 'Right', value: thunk ()};
      } catch (err) {
        either = {tag: 'Left', value: err};
      }
      accum.thunk = null;
      const expected = io.thunk ();

      let pass, repr;
      if (either.tag === 'Left') {
        const {name, message} = either.value;
        pass = io['!'] &&
               name === expected.name &&
               message === expected.message.replace (/^$/, message);
        repr = `! ${expected.message === '' ? name : either.value}`;
      } else {
        pass = !io['!'] && Z.equals (either.value, expected);
        repr = show (either.value);
      }

      accum.results.push ([
        pass,
        repr,
        io['!'] ? `! ${expected}` : show (expected),
        io[':'],
      ]);
    }
    return accum;
  }, {results: [], thunk: null}).results;

const evaluateModule = path => source => {
  const abspath = resolve (path)
                  .replace (/[.][^.]+$/, `-${Date.now ()}.mjs`);

  const cleanup = f => x =>
    fs.promises.unlink (abspath)
    .then (() => f (x));

  return fs.promises.writeFile (abspath, source)
    .then (() => import (abspath))
    .then (module => run (module.__doctest.queue))
    .then (cleanup (Promise.resolve.bind (Promise)),
           cleanup (Promise.reject.bind (Promise)));
};

const commonjsEval = path => async source => {
  const abspath = resolve (path)
                  .replace (/[.][^.]+$/, `-${Date.now ()}.cjs`);

  fs.writeFileSync (abspath, source);
  let queue;
  try {
    ({queue} = (require (abspath)).__doctest);
  } finally {
    fs.unlinkSync (abspath);
  }
  return run (queue);
  /* c8 ignore next */
};

const functionEval = async source => {
  //  Functions created via the Function function are always run in the
  //  global context, which ensures that doctests can't access variables
  //  in _this_ context.
  //
  //  The `evaluate` function takes one argument, named `__doctest`.
  const evaluate = Function ('__doctest', source);
  const queue = [];
  evaluate ({enqueue: io => { queue.push (io); }});
  return run (queue);
  /* c8 ignore next */
};

const log = results => {
  console.log (
    results.reduce ((s, [correct]) => `${s}${correct ? '.' : 'x'}`, '')
  );
  results.forEach (([correct, actual, expected, line]) => {
    if (!correct) {
      console.log (
        `FAIL: expected ${expected} on line ${line} (got ${actual})`
      );
    }
  });
};

const test = options => path => rewrite => evaluate => {
  const source = (
    rewrite ({prefix: options.prefix || '',
              openingDelimiter: options.openingDelimiter,
              closingDelimiter: options.closingDelimiter})
            (fs.readFileSync (path, 'utf8')
             .replace (/\r\n?/g, '\n')
             .replace (/^#!.*/, ''))
  );
  if (options.print) {
    console.log (source.replace (/\n$/, ''));
    return Promise.resolve ([]);
  } else {
    return evaluate (source)
      .then (results => {
        if (!options.silent) {
          console.log (`running doctests in ${path}...`);
          log (results);
        }
        return results;
      });
  }
};

export default options => async path => {
  if (!([undefined, 'amd', 'commonjs', 'esm'].includes (options.module))) {
    throw new Error (`Invalid module ${show (options.module)}`);
  }
  if (options.module === 'esm') {
    return test (options)
                (path)
                (compose (compose (wrapModule))
                         (rewriteJs ('module')))
                (evaluateModule (path));
  } else {
    return test (options)
                (path)
                (options.coffee ?
                 rewriteCoffee :
                 compose (compose (toModule (options.module)))
                         (rewriteJs ('script')))
                (options.module === 'commonjs' ?
                 commonjsEval (path) :
                 functionEval);
  }
  /* c8 ignore next */
};
