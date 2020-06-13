
///          >>>
///          >>>                        >>>                         >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
///    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
///    .....................x.......xx.x.................................

import fs from 'fs';
import {extname, resolve} from 'path';
import {promisify} from 'util';

import acorn from 'acorn';
import CoffeeScript from 'coffeescript';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import require from './require.js';


const inferType = path => {
  switch (extname (path)) {
    case '.coffee': return 'coffee';
    case '.js':     return 'js';
    default:        return null;
  }
};

//    indentN :: Integer -> String -> String
const indentN = n => s => s.replace (/^(?!$)/gm, ' '.repeat (n));

//    quote :: String -> String
const quote = s => `'${s.replace (/'/g, "\\'")}'`;

//    formatLines :: Integer -> NonEmpty (Array { number :: Integer, text :: String }) -> String
const formatLines = indent => lines => {
  const [head, ...tail] = lines.map (line =>
    `{number: ${line.number}, text: ${quote (line.text)}},`
  );
  return tail.reduce ((s, text) => s + '\n' + ' '.repeat (indent) + text,
                      head);
};

//    formatInput :: NonEmpty (Array { text :: String }) -> String
const formatInput = lines => {
  const [head, ...tail] = lines.map (line => line.text.replace (/^\s*/, ''));
  return tail
         .map (text => text.replace (/^[.]+[ ]?/, ''))
         .reduce ((s, text) => `${s}\n${text}`, head.replace (/^[>][ ]?/, ''));
};

//    formatOutput :: Integer -> NonEmpty (Array { text :: String }) -> String
const formatOutput = indent => lines => {
  const [head, ...tail] = lines.map (line => line.text.replace (/^\s*/, ''));
  return (head.startsWith ('!') ? 'throw' : 'return')
         + ' (\n'
         + tail
           .map (text => text.replace (/^[.]+[ ]?/, ''))
           .reduce (
             (s, text) => `${s}\n${' '.repeat (indent + 2)}${text}`,
             ' '.repeat (indent + 2)
             + (m => m == null ? head : `new ${m[1]}(${quote (m[2] || '')})`)
               (/^![ ]?([^:]*)(?::[ ]?(.*))?$/.exec (head))
           )
         + '\n'
         + ' '.repeat (indent)
         + ')';
};

//    wrapFormattedInput :: Integer -> String -> String
const wrapFormattedInput = indent => source =>
  `return (\n${indentN (indent + 2) (source)}\n${' '.repeat (indent)})`;

const wrapJs = sourceType => test => {
  const source = formatInput (test.input.lines);
  const ast = acorn.parse (
    source.startsWith ('{') && source.endsWith ('}') ? `(${source})` : source,
    {ecmaVersion: 2020, sourceType}
  );
  switch (ast.body[0].type) {
    case 'FunctionDeclaration':
    case 'ImportDeclaration':
    case 'VariableDeclaration':
      return source;
    default:
      return `
__doctest.enqueue({
  input: {
    lines: [
      ${formatLines (6) (test.input.lines)}
    ],
    thunk: () => {
      ${wrapFormattedInput (6) (source)};
    },
  },
  output: ${test.output && `{
    lines: [
      ${formatLines (6) (test.output.lines)}
    ],
    thunk: () => {
      ${formatOutput (6) (test.output.lines)};
    },
  }`},
});
`;
  }
};

const wrapCoffee = test => `
__doctest.enqueue {
  input: {
    lines: [
      ${formatLines (6) (test.input.lines)}
    ]
    thunk: ->
      ${wrapFormattedInput (6) (formatInput (test.input.lines))}
  }
  output: ${test.output && `{
    lines: [
      ${formatLines (6) (test.output.lines)}
    ]
    thunk: ->
      ${formatOutput (6) (test.output.lines)}
  }`}
}
`;

const wrapModule = source => `
export const __doctest = {
  queue: [],
  enqueue: function(io) { this.queue.push(io); },
};

${source}
`;

//    Location = { start :: { line :: Integer, column :: Integer }
//               ,   end :: { line :: Integer, column :: Integer } }

//    transformComments
//    :: { prefix :: String
//       , openingDelimiter :: String?
//       , closingDelimiter :: String? }
//    -> Array { type :: String, value :: String, loc :: Location }
//    -> Array { commentIndex :: Integer
//             ,        input :: { lines :: Array { number :: Integer
//                                                , text :: string },
//                                 loc :: Location }
//             ,       output :: { lines :: Array { number :: Integer
//                                                , text :: String },
//                                 loc :: Location } }
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
//    . input: {lines: [{number: 1, text: '> 6 * 7'}],
//    .         loc: {start: {line: 1, column: 0},
//    .               end: {line: 1, column: 10}}},
//    . output: {lines: [{number: 2, text: '42'}],
//    .          loc: {start: {line: 2, column: 0},
//    .                end: {line: 2, column: 5}}}}]
const transformComments = ({
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => comments =>
  comments.reduce (
    (accum, comment, commentIndex) =>
      comment.value.split ('\n')
      .reduce ((accum, text, idx) => {
        let uncommented, start, end;
        if (comment.type === 'Block') {
          uncommented = text.replace (/^\s*[*]/, '');
          start = end = {line: comment.loc.start.line + idx};
        } else if (comment.type === 'Line') {
          uncommented = text;
          ({start, end} = comment.loc);
        }
        if (uncommented.startsWith (prefix)) {
          const unprefixed = uncommented
                             .slice (prefix.length)
                             .replace (/^\s*/, '');
          const line = {number: start.line, text: unprefixed};
          if (accum.state === 'closed') {
            if (unprefixed === openingDelimiter) accum.state = 'open';
          } else if (unprefixed === closingDelimiter) {
            accum.state = 'closed';
          } else if (unprefixed.startsWith ('>')) {
            accum.tests.push ({
              [accum.state = 'input']: {lines: [line], loc: {start, end}},
            });
          } else if (unprefixed.startsWith ('.')) {
            accum.tests[accum.tests.length - 1][accum.state].lines.push (line);
            accum.tests[accum.tests.length - 1][accum.state].loc.end = end;
          } else if (accum.state === 'input') {
            accum.tests[accum.tests.length - 1].commentIndex = commentIndex;
            accum.tests[accum.tests.length - 1][accum.state = 'output'] = {
              lines: [line],
              loc: {start, end},
            };
          }
        }
        return accum;
      }, accum),
    {state: openingDelimiter == null ? 'open' : 'closed', tests: []}
  )
  .tests;

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

const rewriteJs = ({
  sourceType,
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
        blockTests
        .filter (test => test.commentIndex === idx)
        .reduce ((s, test) => `${s}${wrapCode (test)}\n`, '')
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
    (isComment === accum.isComment ?
     current[current.length - 1] :
     current[current.length] = [])
    .push ({number: idx + 1, text: line});
    accum.isComment = isComment;
    return accum;
  }, {
    literalChunks: [[]],
    commentChunks: [],
    isComment: false,
  });

  const testChunks = chunks.commentChunks.map (commentChunk =>
    Z.map (
      test => indentN (test.indent.length) (wrapCoffee (test)),
      Z.reduce (
        (accum, {number, text}) => {
          const [, indent, uncommented] = text.match (/^([ \t]*)#(.*)$/);
          if (uncommented.startsWith (prefix)) {
            const unprefixed = uncommented
                               .slice (prefix.length)
                               .replace (/^\s*/, '');
            const line = {number, text: unprefixed};
            if (accum.state === 'closed') {
              if (unprefixed === openingDelimiter) accum.state = 'open';
            } else if (unprefixed === closingDelimiter) {
              accum.state = 'closed';
            } else if (unprefixed.startsWith ('>')) {
              accum.tests.push ({
                indent,
                [accum.state = 'input']: {lines: [line]},
              });
            } else if (unprefixed.startsWith ('.')) {
              accum.tests[accum.tests.length - 1][accum.state].lines.push (
                line
              );
            } else if (accum.state === 'input') {
              accum.tests[accum.tests.length - 1][accum.state = 'output'] = {
                lines: [line],
              };
            }
          }
          return accum;
        },
        {state: openingDelimiter == null ? 'open' : 'closed', tests: []},
        commentChunk
      )
      .tests
    )
  );

  return CoffeeScript.compile (
    chunks.literalChunks.reduce (
      (s, chunk, idx) => Z.reduce (
        (s, line) => `${s}${line}\n`,
        chunk.reduce ((s, line) => `${s}${line.text}\n`, s),
        idx < testChunks.length ? testChunks[idx] : []
      ),
      ''
    )
  );
};

//    arrowWrap :: String -> String
const arrowWrap = s => `void (() => {\n${indentN (2) (s)}})();`;

//    toModule :: (String, String?) -> String
const toModule = (source, moduleType) => {
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

const attempt = thunk => {
  try {
    return {throws: false, result: thunk ()};
    /* c8 ignore next */
  } catch (exception) {
    return {throws: true, exception};
  }
};

const run = queue =>
  queue.flatMap (({input, output}) => {
    const i = attempt (input.thunk);
    if (output == null) return [];
    const o = attempt (output.thunk);
    return [{
      correct: (
        o.throws
        ? i.throws &&
          i.exception.name === o.exception.name &&
          i.exception.message === (o.exception.message || i.exception.message)
        : !i.throws &&
          Z.equals (i.result, o.result)
      ),
      input: {lines: input.lines, ...i},
      output: {lines: output.lines, ...o},
    }];
  });

const evaluateModule = (source, path) => {
  const abspath = resolve (path)
                  .replace (/[.][^.]+$/, `-${Date.now ()}.mjs`);

  const cleanup = f => x =>
    promisify (fs.unlink) (abspath)
    .then (() => f (x));

  return promisify (fs.writeFile) (abspath, source)
    .then (() => import (abspath))
    .then (module => run (module.__doctest.queue))
    .then (cleanup (Promise.resolve.bind (Promise)),
           cleanup (Promise.reject.bind (Promise)));
};

const commonjsEval = (source, path) => {
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
};

const functionEval = source => {
  //  Functions created via the Function function are always run in the
  //  global context, which ensures that doctests can't access variables
  //  in _this_ context.
  //
  //  The `evaluate` function takes one argument, named `__doctest`.
  const evaluate = Function ('__doctest', source);
  const queue = [];
  evaluate ({enqueue: io => { queue.push (io); }});
  return run (queue);
};

const evaluate = (moduleType, source, path) =>
  moduleType === 'commonjs' ?
    commonjsEval (source, path) :
    functionEval (source);

const log = results => {
  console.log (
    results.reduce ((s, {correct}) => `${s}${correct ? '.' : 'x'}`, '')
  );
  results.forEach (({correct, input, output}) => {
    if (!correct) {
      const format = r => r.throws ? `! ${r.exception}` : show (r.result);
      const actual = format (input);
      const expected = format (output);
      const line = output.lines[0].number;
      console.log (
        `FAIL: expected ${expected} on line ${line} (got ${actual})`
      );
    }
  });
};

const doctest = ({
  module,
  prefix = '',
  openingDelimiter,
  closingDelimiter,
  print,
  silent,
  type,
}) => path => {
  if (module != null &&
      module !== 'amd' &&
      module !== 'commonjs') {
    return Promise.reject (new Error (`Invalid module \`${module}'`));
  }
  if (type != null &&
      type !== 'coffee' &&
      type !== 'js') {
    return Promise.reject (new Error (`Invalid type \`${type}'`));
  }

  const type_ = type == null ? inferType (path) : type;
  if (type_ == null) {
    return Promise.reject (new Error (
      'Cannot infer type from extension'
    ));
  }

  const rewriters = {coffee: rewriteCoffee, js: rewriteJs};
  const source = toModule (
    rewriters[type_] ({prefix,
                       openingDelimiter,
                       closingDelimiter,
                       sourceType: 'script'})
                     (fs.readFileSync (path, 'utf8')
                      .replace (/\r\n?/g, '\n')
                      .replace (/^#!.*/, '')),
    module
  );

  if (print) {
    console.log (source.replace (/\n$/, ''));
    return Promise.resolve ([]);
  } else if (silent) {
    return Promise.resolve (evaluate (module, source, path));
  } else {
    console.log (`running doctests in ${path}...`);
    const results = evaluate (module, source, path);
    log (results);
    return Promise.resolve (results);
  }
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

  const source = wrapModule (
    rewriteJs ({prefix,
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
    return evaluateModule (source, path);
  } else {
    console.log (`running doctests in ${path}...`);
    return evaluateModule (source, path)
      .then (results => ((log (results), results)));
    /* c8 ignore next */
  }
};
