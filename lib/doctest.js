
///          >>>
///          >>>                        >>>                         >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
///    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
///    .....................x.......xx.x.................................

import fs from 'fs';
import {basename, dirname, extname, join, resolve} from 'path';
import {promisify} from 'util';
import vm from 'vm';

import acorn from 'acorn';
import CoffeeScript from 'coffeescript';
import Z from 'sanctuary-type-classes';

import require from './require.js';


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

//    contiguous :: { number :: Integer } -> NonEmpty (Array { number :: Integer }) -> Boolean
const contiguous = line => lines =>
  line.number === lines[lines.length - 1].number + 1;

const rewriteJs = ({
  sourceType,
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => source => {
  const comments = [];
  acorn.parse (source, {
    ecmaVersion: 2020,
    sourceType,
    locations: true,
    onComment: comments,
  });

  //    literalChunks :: Array (Array2 NonNegativeInteger String)
  const literalChunks =
  comments
  .concat ([{start: Infinity, end: Infinity}])
  .reduce (
    (accum, {start, end}) => {
      accum.chunks.push ([
        accum.offset,
        source.slice (accum.offset, start),
      ]);
      accum.offset = end;
      return accum;
    },
    {chunks: [], offset: 0}
  )
  .chunks;

  //    commentChunks :: Array (Array2 NonNegativeInteger String)
  const commentChunks =
  comments
  .flatMap (
    ({type, value, start, end, loc}) =>
      type === 'Line'
      ? [{value, start, end, number: loc.start.line}]
      : value
        .split ('\n')
        .reduce (
          (accum, value) => {
            accum.lines.push ({
              value: value.replace (/^\s*[*]/, ''),
              start: accum.offset,
              end: accum.offset += value.length,
              number: accum.number,
            });
            accum.offset += '\n'.length;
            accum.number += 1;
            return accum;
          },
          {offset: start, number: loc.start.line, lines: []}
        )
        .lines
  )
  .reduce (
    (accum, {value, start, end, number}) => {
      if (value.startsWith (prefix)) {
        const text = value
                     .slice (prefix.length)
                     .replace (/^\s*/, '');
        const line = {number, text};
        if (accum.state === 'closed') {
          if (text === openingDelimiter) accum.state = 'open';
        } else if (text === closingDelimiter) {
          accum.state = 'closed';
        } else if (text.startsWith ('>')) {
          accum.tests.push ({[accum.state = 'input']: {lines: [line], start}});
        } else if (text.startsWith ('.')) {
          accum.tests[accum.tests.length - 1][accum.state].lines.push (line);
        } else if (accum.state === 'input') {
          //  A comment immediately following an input line is an output
          //  line if and only if it contains non-whitespace characters.
          const {lines} = accum.tests[accum.tests.length - 1].input;
          if (contiguous (line) (lines) && text !== '') {
            accum.tests[accum.tests.length - 1][accum.state = 'output'] =
              {lines: [line], start};
          } else {
            accum.state = 'open';
          }
        }
      }
      return accum;
    },
    {tests: [], state: openingDelimiter == null ? 'open' : 'closed'}
  )
  .tests
  .map (test => [test.input.start, wrapJs (sourceType) (test)]);

  return (source => sourceType === 'module'
                    ? 'export const __doctest = {\n' +
                      '  queue: [],\n' +
                      '  enqueue: function(io) { this.queue.push(io); },\n' +
                      '};\n' +
                      '\n' +
                      source
                    : source)
         (Z.sort (Z.concat (literalChunks, commentChunks))
          .map (([, text]) => text)
          .join (''));
};

const rewriteCoffee = ({
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => source => {
  const lines = source.match (/^.*(?=\n)/gm);
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
              //  A comment immediately following an input line is an output
              //  line if and only if it contains non-whitespace characters.
              const {lines} = accum.tests[accum.tests.length - 1].input;
              if (contiguous (line) (lines) && unprefixed !== '') {
                accum.tests[accum.tests.length - 1][accum.state = 'output'] = {
                  lines: [line],
                };
              } else {
                accum.state = 'open';
              }
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

const attempt = thunk => (...args) => {
  try {
    return {throws: false, result: thunk (...args)};
  } catch (exception) {
    return {throws: true, exception};
  }
};

const run = options => queue =>
  queue.reduce ((prev, {input, output}) => prev.then (results => {
    const actuals = [];
    const logFunctions = options.

    actuals.push ({
      channel: null,
      value: attempt (input.thunk) (...logFunctions)
    });

    if (output == null) return results;

    const expecteds = output.map (() => attempt (output.thunk) ());

    return results.concat ([{
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
    }]);
  }), Promise.resolve ([]));

const evaluateModule = path => source =>
  promisify (fs.writeFile) (path, source)
  .then (() => import (path))
  .then (module => run (module.__doctest.queue))
  .finally (() => promisify (fs.unlink) (path));

const evaluateScript = context => source => {
  const queue = [];
  const enqueue = x => { queue.push (x); };
  vm.runInNewContext (source, {__doctest: {enqueue, require}, ...context});
  return Promise.resolve (run (queue));
};

export default ({
  module,
  prefix = '',
  openingDelimiter,
  closingDelimiter,
  print,
  silent,
  type,
}) => path =>
  Promise.resolve ({})
  .then (({}) => {
    switch (module) {
      case 'amd': {
        const define = (...args) => args[args.length - 1] ();
        return Promise.resolve ({
          sourceType: 'script',
          evaluate: evaluateScript ({define}),
        });
      }
      case 'commonjs': {
        const exports = {};
        const module = {exports};
        const __filename = resolve (process.cwd (), path);
        return Promise.resolve ({
          sourceType: 'script',
          evaluate: evaluateScript ({
            process,
            exports,
            module,
            require,
            __dirname: dirname (__filename),
            __filename,
          }),
        });
      }
      case 'esm': {
        if (type != null) {
          return Promise.reject (
            new Error ('Cannot use file type when module is "esm"')
          );
        }
        const abs = resolve (path);
        const now = Date.now ();
        return Promise.resolve ({
          sourceType: 'module',
          evaluate: evaluateModule (
            join (dirname (abs), `${basename (abs, extname (abs))}-${now}.mjs`)
          ),
        });
      }
      case undefined: {
        return Promise.resolve ({
          sourceType: 'script',
          evaluate: evaluateScript ({}),
        });
      }
      default: {
        return Promise.reject (
          new Error (`Invalid module ${JSON.stringify (module)}`)
        );
      }
    }
  })
  .then (({sourceType, evaluate}) => {
    switch (type) {
      case 'coffee':
        return Promise.resolve ({sourceType, evaluate, type: 'coffee'});
      case 'js':
        return Promise.resolve ({sourceType, evaluate, type: 'js'});
      case undefined:
        switch (extname (path)) {
          case '.coffee':
            return Promise.resolve ({sourceType, evaluate, type: 'coffee'});
          case '.js':
          case '.mjs':
            return Promise.resolve ({sourceType, evaluate, type: 'js'});
          default:
            return Promise.reject (
              new Error ('Cannot infer type from extension')
            );
        }
      default:
        return Promise.reject (
          new Error (`Invalid type ${JSON.stringify (type)}`)
        );
    }
  })
  .then (({sourceType, evaluate, type}) => {
    switch (type) {
      case 'coffee':
        return {evaluate,
                rewrite: rewriteCoffee ({prefix,
                                         openingDelimiter,
                                         closingDelimiter})};
      case 'js':
        return {evaluate,
                rewrite: rewriteJs ({sourceType,
                                     prefix,
                                     openingDelimiter,
                                     closingDelimiter})};
    }
  })
  .then (({evaluate, rewrite}) =>
    promisify (fs.readFile) (path, 'utf8')
    .then (source => source.replace (/\r\n?/g, '\n'))
    .then (source => source.replace (/^#!.*/, ''))
    .then (rewrite)
    .then (source => print ? Promise.resolve (source) : evaluate (source))
  );
