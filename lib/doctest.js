
///          >>>
///          >>>                        >>>                         >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
///    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
///    .....................x.......xx.x.................................

import fs from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import url from 'node:url';
import vm from 'node:vm';

import * as acorn from 'acorn';
import CoffeeScript from 'coffeescript';
import show from 'sanctuary-show';
import Z from 'sanctuary-type-classes';

import {Incorrect, Correct} from './Comparison.js';
import {Success, effect, encase} from './Effect.js';
import {Line} from './Line.js';
import {Channel} from './Output.js';
import require from './require.js';


const wrapJs = sourceType => logFunctions => ({input, outputs}) => {
  let source = '';
  for (const {text} of input.lines) {
    source += text.replace (/^\s*([>]|[.]+)[ ]?/, '') + '\n';
  }

  if (
    acorn.parse (
      source.replace (/^[{].*[}]\n$/s, '($&)'),
      {ecmaVersion: 2023, sourceType}
    )
    .body[0].type !== 'ExpressionStatement'
  ) return source;

  source = '';
  source     += '\n';
  source     += '__doctest.enqueue({\n';
  source     += '  input: {\n';
  source     += '    lines: [\n';
  for (const {number, text} of input.lines) {
    source   += `      {number: ${show (number)}, text: ${show (text)}},\n`;
  }
  source     += '    ],\n';
  source     += `    thunk: ([${logFunctions.join (', ')}]) => {\n`;
  source     += '      return (\n';
  for (const {text} of input.lines) {
    source   += `        ${text.replace (/^\s*([>]|[.]+)[ ]?/, '')}\n`;
  }
  source     += '      );\n';
  source     += '    },\n';
  source     += '  },\n';
  source     += '  outputs: [\n';
  for (const {lines, channel} of outputs) {
    source   += '    {\n';
    source   += '      lines: [\n';
    for (const {number, text} of lines) {
      source += `        {number: ${show (number)}, text: ${show (text)}},\n`;
    }
    source   += '      ],\n';
    source   += `      channel: ${show (channel)},\n`;
    source   += `      thunk: ([${logFunctions.join (', ')}]) => {\n`;
    {
      const parts = lines.map (line =>
        line.text.replace (/^\s*([.]+[ ]?)?/, '')
      );
      const options = {
        ecmaVersion: 2023,
        allowReturnOutsideFunction: true,
      };
      let isExpression = false;
      try {
        isExpression = (
          (acorn.parse (parts.join ('\n'), options)).body[0].type
          !== 'ExpressionStatement'
        );
      } catch {}
      if (isExpression) {
        for (const part of parts) {
          source += `        ${part}\n`;
        }
      } else {
        source   += '        return (\n';
        for (const part of parts) {
          source += `          ${part}\n`;
        }
        source   += '        );\n';
      }
    }
    source   += '      },\n';
    source   += '    },\n';
  }
  source     += '  ],\n';
  source     += '});\n';
  return source;
};

const wrapCoffee = logFunctions => ({input, outputs, indent}) => {
  let source = '';
  source     += `${indent}__doctest.enqueue {\n`;
  source     += `${indent}  input: {\n`;
  source     += `${indent}    lines: [\n`;
  for (let {number, text} of input.lines) {
    number = show (number);
    text = show (text);
    source   += `${indent}      {number: ${number}, text: ${text}}\n`;
  }
  source     += `${indent}    ]\n`;
  source     += `${indent}    thunk: ([${logFunctions.join (', ')}]) ->\n`;
  for (const {text} of input.lines) {
    source   += `${indent}      ${text.replace (/^\s*([>]|[.]+)[ ]?/, '')}\n`;
  }
  source     += `${indent}  }\n`;
  source     += `${indent}  outputs: [\n`;
  for (const {lines, channel} of outputs) {
    source   += `${indent}    {\n`;
    source   += `${indent}      lines: [\n`;
    for (let {number, text} of lines) {
      number = show (number);
      text = show (text);
      source += `${indent}        {number: ${number}, text: ${text}}\n`;
    }
    source   += `${indent}      ]\n`;
    source   += `${indent}      channel: ${show (channel)}\n`;
    source   += `${indent}      thunk: ([${logFunctions.join (', ')}]) ->\n`;
    for (const {text} of lines) {
      source += `${indent}        ${text.replace (/^\s*([.]+[ ]?)?/, '')}\n`;
    }
    source   += `${indent}    }\n`;
  }
  source     += `${indent}  ]\n`;
  source     += `${indent}}\n`;
  return source;
};

//    contiguous :: Line -> NonEmpty (Array Line) -> Boolean
const contiguous = line => lines => (
  line.number === lines[lines.length - 1].number + 1
);

const rewriteJs = sourceType => ({
  prefix,
  openingDelimiter,
  closingDelimiter,
  logFunctions,
}) => input => {
  const comments = [];
  acorn.parse (input, {
    ecmaVersion: 2023,
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
        input.slice (accum.offset, start),
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
    (accum, {value, start, number}) => {
      if (value.startsWith (prefix)) {
        const text = value
                     .slice (prefix.length)
                     .replace (/^\s*/, '');
        const line = Line (number) (text);
        if (accum.state === 'closed') {
          if (text === openingDelimiter) accum.state = 'open';
        } else if (text === closingDelimiter) {
          accum.state = 'closed';
        } else if (text.startsWith ('>')) {
          accum.state = 'input';
          accum.tests.push ({
            input: {channel: null, lines: [line], start},
            outputs: [],
          });
        } else if (text.startsWith ('.')) {
          const {input, outputs} = accum.tests[accum.tests.length - 1];
          if (accum.state === 'input') {
            input.lines.push (line);
          } else {
            outputs[outputs.length - 1].lines.push (line);
          }
        } else if (accum.state === 'input' || accum.state === 'outputs') {
          const {input, outputs} = accum.tests[accum.tests.length - 1];
          if (
            //  A comment immediately following an input line is an output
            //  line if and only if it contains non-whitespace characters.
            contiguous (line)
                       (input.lines.concat (outputs.flatMap (o => o.lines))) &&
            text !== ''
          ) {
            accum.state = 'outputs';
            outputs.push ({channel: null, lines: [line], start});
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
  .map (test => [test.input.start, wrapJs (sourceType) (logFunctions) (test)]);

  return Z.sort (Z.concat (literalChunks, commentChunks))
         .map (([, text]) => text)
         .join ('');
};

const rewriteCoffee = ({
  prefix,
  openingDelimiter,
  closingDelimiter,
  logFunctions,
}) => input => {
  const lines = input.match (/^.*(?=\n)/gm);
  const chunks = lines.reduce ((accum, text, idx) => {
    const isComment = /^[ \t]*#(?!##)/.test (text);
    const current = isComment ? accum.commentChunks : accum.literalChunks;
    const line = Line (idx + 1) (text);
    if (isComment === accum.isComment) {
      current[current.length - 1].push (line);
    } else {
      current.push ([line]);
    }
    accum.isComment = isComment;
    return accum;
  }, {
    literalChunks: [[]],
    commentChunks: [],
    isComment: false,
  });

  const testChunks = chunks.commentChunks.map (commentChunk =>
    commentChunk.reduce ((accum, {number, text}) => {
      const [, indent, uncommented] = text.match (/^([ \t]*)#(.*)$/);
      if (uncommented.startsWith (prefix)) {
        const unprefixed = uncommented
                           .slice (prefix.length)
                           .replace (/^\s*/, '');
        const line = Line (number) (unprefixed);
        if (accum.state === 'closed') {
          if (unprefixed === openingDelimiter) accum.state = 'open';
        } else if (unprefixed === closingDelimiter) {
          accum.state = 'closed';
        } else if (unprefixed.startsWith ('>')) {
          accum.state = 'input';
          accum.tests.push ({
            indent,
            input: {
              lines: [line],
            },
            outputs: [],
          });
        } else if (unprefixed.startsWith ('.')) {
          const {input, outputs} = accum.tests[accum.tests.length - 1];
          if (accum.state === 'input') {
            input.lines.push (line);
          } else {
            outputs[outputs.length - 1].lines.push (line);
          }
        } else if (accum.state === 'input' || accum.state === 'outputs') {
          const {input, outputs} = accum.tests[accum.tests.length - 1];
          if (
            //  A comment immediately following an input line is an output
            //  line if and only if it contains non-whitespace characters.
            contiguous (line)
                       (input.lines
                        .concat (outputs.flatMap (o => o.lines))) &&
            unprefixed !== ''
          ) {
            accum.state = 'outputs';
            outputs.push ({channel: null, lines: [line]});
          }
        }
      }
      return accum;
    }, {state: openingDelimiter == null ? 'open' : 'closed', tests: []})
    .tests
    .map (wrapCoffee (logFunctions))
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

const sentinel = {};

const readSourceFile = async path => (
  (await fs.readFile (path, 'utf8'))
  .replace (/\r\n?/g, '\n')
  .replace (/^#!.*/, '')
);

const evaluateModule = moduleUrl => async source => {
  const queue = [];
  const enqueue = io => { queue.push (io); };
  const __doctest = {enqueue};
  const context = vm.createContext ({...global, __doctest});
  const module = new vm.SourceTextModule (source, {context});
  await module.link (async (specifier, referencingModule) => {
    //  import.meta.resolve returned a promise prior to Node.js v20.0.0.
    const importUrl = await import.meta.resolve (specifier, moduleUrl);
    const entries = Object.entries (await import (importUrl));
    const module = new vm.SyntheticModule (
      entries.map (([name]) => name),
      () => {
        for (const [name, value] of entries) {
          module.setExport (name, value);
        }
      },
      {identifier: specifier, context: referencingModule.context}
    );
    return module;
  });
  await module.evaluate ();
  return queue;
};

const evaluateScript = context => async source => {
  const queue = [];
  const enqueue = io => { queue.push (io); };
  const __doctest = {enqueue, require};
  vm.runInNewContext (source, {...global, ...context, __doctest});
  return queue;
};

const run = channels => timeout => async queue => {
  const tests = [];
  for (const {input, outputs} of queue) {
    const actuals = await new Promise (res => {
      const actuals = [];
      let open = true;
      let job;

      const done = () => {
        open = false;
        clearTimeout (job);
        res (actuals);
      };

      const logFunctions = channels.map (channel => value => {
        if (open) {
          actuals.push (Success (Channel (channel) (value)));
          clearTimeout (job);
          job = setTimeout (done, timeout);
        }
      });

      actuals.push (encase (input.thunk) (logFunctions));

      job = setTimeout (done, timeout);
    });

    if (outputs.length === 0) continue;

    const expecteds = [];
    const logFunctions = channels.map (channel => value => ((
      expecteds.push (Success (Channel (channel) (value))),
      sentinel
    )));
    for (const output of outputs) {
      const expected = encase (output.thunk) (logFunctions);
      if (effect (_ => true) (({value}) => value !== sentinel) (expected)) {
        expecteds.push (expected);
      }
    }
    const isError = x => (
      Object.prototype.toString.call (x) === '[object Error]'
    );
    const test = {
      lines: {
        input: input.lines,
        output: outputs.flatMap (output => output.lines),
      },
      comparison: (
        actuals.length === expecteds.length &&
        actuals.every ((a, idx) =>
          effect (a => effect (e => isError (a) && isError (e)
                                    ? a.name === e.name &&
                                      a.message === (e.message || a.message)
                                    : Z.equals (a, e))
                              (_ => false))
                 (a => effect (_ => false)
                              (e => Z.equals (a, e)))
                 (a)
                 (expecteds[idx])
        )
        ? Correct (actuals)
        : Incorrect (actuals) (expecteds)
      ),
    };
    tests.push (test);
  }
  return tests;
};

export default ({
  module,
  coffee = false,
  prefix = '',
  openingDelimiter,
  closingDelimiter,
  logFunctions = [],
  timeout = logFunctions.length > 0 ? 100 : 0,
  print = false,
}) => async path => {
  const __filename = resolve (process.cwd (), path);
  let context = {};
  const options = {prefix, openingDelimiter, closingDelimiter, logFunctions};
  switch (module) {
    case 'esm': {
      const rewrite = rewriteJs ('module');
      const source = rewrite (options) (await readSourceFile (path));
      if (print) return source;
      const moduleUrl = url.pathToFileURL (__filename);
      const queue = await evaluateModule (moduleUrl) (source);
      return run (logFunctions) (timeout) (queue);
    }
    case 'commonjs': {
      const exports = {};
      const module = {exports};
      const __dirname = dirname (__filename);
      context = {process, exports, module, require, __dirname, __filename};
    } // fall through
    case undefined: {
      const rewrite = coffee ? rewriteCoffee : rewriteJs ('script');
      const source = rewrite (options) (await readSourceFile (path));
      if (print) return source;
      const queue = await evaluateScript (context) (source);
      return run (logFunctions) (timeout) (queue);
    }
    default: {
      throw new Error (`Invalid module ${show (module)}`);
    }
  }
  /* c8 ignore next */
};
