
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

//    last :: NonEmpty (Array a) -> a
const last = xs => xs[xs.length - 1];

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

const wrapJs = sourceType => logFunctionNames => test => {
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
    thunk: (${logFunctionNames.join (', ')}) => {
      ${wrapFormattedInput (6) (source)};
    },
  },
  outputs: [
    ${(test.outputs.map (output =>
    `{
      lines: [
        ${formatLines (8) (output.lines)}
      ],
      channel: ${JSON.stringify (output.channel)},
      thunk: () => {
        ${formatOutput (8) (output.lines)};
      },
    },`)).join ('\n')}
  ],
});
`;
  }
};

const wrapCoffee = logFunctionNames => test => `
__doctest.enqueue {
  input: {
    lines: [
      ${formatLines (6) (test.input.lines)}
    ]
    thunk: (${logFunctionNames.join (', ')}) ->
      ${wrapFormattedInput (6) (formatInput (test.input.lines))}
  }
  outputs: [${(test.outputs.map (output => `
    {
      lines: [
        ${formatLines (8) (output.lines)}
      ]
      channel: ${JSON.stringify (output.channel)}
      thunk: ->
        ${formatOutput (8) (output.lines)}
    }`)).join (',')}
  ]
}
`;

//    contiguous :: { number :: Integer } -> NonEmpty (Array { number :: Integer }) -> Boolean
const contiguous = line => lines =>
  line.number === (last (lines)).number + 1;

const rewriteJs = ({
  sourceType,
  prefix,
  openingDelimiter,
  closingDelimiter,
  logFunction,
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
      let match = null;
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
          accum.state = 'input';
          const channel = null;
          const lines = [line];
          accum.tests.push ({input: {channel, lines, start}, outputs: []});
        } else if (text.startsWith ('.')) {
          if (accum.state === 'input') {
            (last (accum.tests)).input.lines.push (line);
          } else {
            (last ((last (accum.tests)).outputs)).lines.push (line);
          }
        } else if ((match = /^\[(.+?)\]:[ ]?(.*)$/.exec (text)) != null) {
          const [, channel, expression] = match;
          if (logFunction.includes (channel)) {
            accum.state = 'outputs';
            const lines = [{number, text: expression}];
            (last (accum.tests)).outputs.push ({channel, lines, start});
          }
        } else if (accum.state === 'input' || accum.state === 'outputs') {
          const {input, outputs} = last (accum.tests);
          if (
            //  A comment immediately following an input line is an output
            //  line if and only if it contains non-whitespace characters.
            contiguous (line)
                       (input.lines.concat (outputs.flatMap (o => o.lines))) &&
            text !== '' &&
            !(outputs.some (o => o.channel == null))
          ) {
            accum.state = 'outputs';
            const channel = null;
            const lines = [line];
            (last (accum.tests)).outputs.push ({channel, lines, start});
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
  .map (test => [test.input.start, wrapJs (sourceType) (logFunction) (test)]);

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
  logFunction,
}) => source => {
  const lines = source.match (/^.*(?=\n)/gm);
  const chunks = lines.reduce ((accum, line, idx) => {
    const isComment = /^[ \t]*#(?!##)/.test (line);
    const current = isComment ? accum.commentChunks : accum.literalChunks;
    (isComment === accum.isComment ?
     last (current) :
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
      test => indentN (test.indent.length) (wrapCoffee (logFunction) (test)),
      Z.reduce (
        (accum, {number, text}) => {
          let match = null;
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
              accum.state = 'input';
              const input = {lines: [line]};
              const outputs = [];
              accum.tests.push ({indent, input, outputs});
            } else if (unprefixed.startsWith ('.')) {
              if (accum.state === 'input') {
                (last (accum.tests)).input.lines.push (line);
              } else {
                (last ((last (accum.tests)).outputs)).lines.push (line);
              }
            } else if ((match = /^\[(.+?)\]:[ ]?(.*)$/.exec (unprefixed)) != null) {
              const [, channel, expression] = match;
              if (logFunction.includes (channel)) {
                accum.state = 'outputs';
                const lines = [{number, text: expression}];
                (last (accum.tests)).outputs.push ({channel, lines});
              }
            } else if (accum.state === 'input' || accum.state === 'outputs') {
              const {input, outputs} = last (accum.tests);
              if (
                //  A comment immediately following an input line is an output
                //  line if and only if it contains non-whitespace characters.
                contiguous (line)
                           (input.lines.concat (outputs.flatMap (o => o.lines))) &&
                unprefixed !== '' &&
                !(outputs.some (o => o.channel == null))
              ) {
                accum.state = 'outputs';
                const channel = null;
                const lines = [line];
                (last (accum.tests)).outputs.push ({channel, lines});
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

const Success = result => ({throws: false, result});
const Failure = exception => ({throws: true, exception});

const encase = f => (...args) => {
  try {
    return Success (f (...args));
  } catch (exception) {
    return Failure (exception);
  }
};

const exceptionEq = (a, b) => (
  a.name === b.name && a.message === (b.message || a.message)
);

const run = ({logFunction, logTimeout}) => queue =>
  queue.reduce ((prev, {input, outputs}) => prev.then (results => (
    new Promise (res => {
      const actuals = [];
      let job, open = true;

      const done = () => {
        open = false;
        clearTimeout (job);
        res (actuals);
      };

      const logFunctions = logFunction.map (channel => (
        function log(value) {
          if (open) {
            actuals.push ({channel, value: Success (value), lines: input.lines});
            clearTimeout (job);
            job = setTimeout (done, logTimeout);
          }
        }
      ));

      actuals.push ({
        channel: null,
        lines: input.lines,
        value: encase (input.thunk) (...logFunctions),
      });

      if (logFunctions.length === 0) {
        done ();
      } else {
        job = setTimeout (done, logTimeout);
      }
    }).then (actuals => {
      const expecteds = outputs.map (output => ({
        channel: output.channel,
        lines: output.lines,
        value: encase (output.thunk) (),
      }));

      if (expecteds.length === 0) return results;

      const testAssertions = actuals.map ((actual, i) => {
        const expected = expecteds[i];

        if (expected == null) {
          return {
            correct: false,
            actual: [actual],
            expected: [],
          };
        }

        return {
          // TODO: ADT for different types of failures? eg.
          //   IncorrectOutputChannel
          //   NoMatchingValues
          correct: (
            expected.channel === actual.channel &&
            expected.value.throws === actual.value.throws &&
            expected.value.throws
            ? exceptionEq (actual.value.exception, expected.value.exception)
            : Z.equals (actual.value.result, expected.value.result)
          ),
          actual: [actual],
          expected: [expected],
        };
      });

      const unmetExpectations = (expecteds.slice (outputs.length)).map (expected => ({
        correct: false,
        actual: [],
        expected: [expected],
      }));

      return results.concat ([testAssertions.concat (unmetExpectations)]);
    })
  )), Promise.resolve ([]));

const evaluateModule = ({logFunction, logTimeout}) => path => source =>
  promisify (fs.writeFile) (path, source)
  .then (() => import (path))
  .then (module => run ({logFunction, logTimeout}) (module.__doctest.queue))
  .finally (() => promisify (fs.unlink) (path));

const evaluateScript = ({logFunction, logTimeout}) => context => source => {
  const queue = [];
  const enqueue = x => { queue.push (x); };
  // TODO: Inject all Node globals?
  vm.runInNewContext (source, {
    __doctest: {enqueue, require},
    setTimeout,
    setImmediate,
    ...context,
  });
  return run ({logFunction, logTimeout}) (queue);
};

export default ({
  module,
  prefix = '',
  openingDelimiter,
  closingDelimiter,
  print,
  silent,
  type,
  logFunction,
  logTimeout,
}) => path =>
  Promise.resolve ({})
  .then (({}) => {
    switch (module) {
      case 'amd': {
        const define = (...args) => last (args) ();
        return Promise.resolve ({
          sourceType: 'script',
          evaluate: evaluateScript ({logFunction, logTimeout}) ({define}),
        });
      }
      case 'commonjs': {
        const exports = {};
        const module = {exports};
        const __filename = resolve (process.cwd (), path);
        return Promise.resolve ({
          sourceType: 'script',
          evaluate: evaluateScript ({logFunction, logTimeout}) ({
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
          evaluate: evaluateModule ({logFunction, logTimeout}) (
            join (dirname (abs), `${basename (abs, extname (abs))}-${now}.mjs`)
          ),
        });
      }
      case undefined: {
        return Promise.resolve ({
          sourceType: 'script',
          evaluate: evaluateScript ({logFunction, logTimeout}) ({}),
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
                                         closingDelimiter,
                                         logFunction})};
      case 'js':
        return {evaluate,
                rewrite: rewriteJs ({sourceType,
                                     prefix,
                                     openingDelimiter,
                                     closingDelimiter,
                                     logFunction})};
    }
  })
  .then (({evaluate, rewrite}) =>
    promisify (fs.readFile) (path, 'utf8')
    .then (source => source.replace (/\r\n?/g, '\n'))
    .then (source => source.replace (/^#!.*/, ''))
    .then (rewrite)
    .then (source => print ? Promise.resolve (source) : evaluate (source))
  );
