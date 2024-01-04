
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

import {Incorrect, Correct, comparison} from './Comparison.js';
import {Failure, Success, effect, encase} from './Effect.js';
import {Line} from './Line.js';
import require from './require.js';


//    formatLines :: String -> NonEmpty (Array Line) -> String
const formatLines = indent => lines => (
  lines
  .map (line => `{number: ${show (line.number)}, text: ${show (line.text)}},`)
  .join (`\n${indent}`)
);

//    formatInput :: String -> NonEmpty (Array Line) -> String
const formatInput = indent => lines => (
  lines
  .map (line => line.text.replace (/^\s*([>]|[.]+)[ ]?/, ''))
  .join (`\n${indent}`)
);

//    formatOutput :: String -> NonEmpty (Array Line) -> String
const formatOutput = indent => lines => {
  const [head, ...tail] = lines.map (line => line.text.replace (/^\s*/, ''));
  const match = /^![ ]?([^:]*)(?::[ ]?(.*))?$/.exec (head);
  return [
    `${head.startsWith ('!') ? 'throw' : 'return'} (`,
    `  ${match == null ? head : `new ${match[1]}(${show (match[2] ?? '')})`}`,
    ...(tail.map (text => '  ' + text.replace (/^[.]+[ ]?/, ''))),
    ')',
  ].join (`\n${indent}`);
};

const wrapJs = sourceType => ({input, output}) => {
  const source = formatInput ('') (input.lines);
  const ast = acorn.parse (
    source.startsWith ('{') && source.endsWith ('}') ? `(${source})` : source,
    {ecmaVersion: 2023, sourceType}
  );
  const {type} = ast.body[0];
  if (type !== 'ExpressionStatement') return source;

  return `
__doctest.enqueue({
  input: {
    lines: [
      ${formatLines ('      ') (input.lines)}
    ],
    thunk: () => {
      return (
        ${formatInput ('        ') (input.lines)}
      );
    },
  },
  output: ${output && `{
    lines: [
      ${formatLines ('      ') (output.lines)}
    ],
    thunk: () => {
      ${formatOutput ('      ') (output.lines)};
    },
  }`},
});`;
};

const wrapCoffee = ({indent, input, output}) => `
${indent}__doctest.enqueue {
${indent}  input: {
${indent}    lines: [
${indent}      ${formatLines (`${indent}      `) (input.lines)}
${indent}    ]
${indent}    thunk: ->
${indent}      ${formatInput (`${indent}      `) (input.lines)}
${indent}  }
${indent}  output: ${output && `{
${indent}    lines: [
${indent}      ${formatLines (`${indent}      `) (output.lines)}
${indent}    ]
${indent}    thunk: ->
${indent}      ${formatOutput (`${indent}      `) (output.lines)}
${indent}  }`}
${indent}}
`;

//    contiguous :: Line -> NonEmpty (Array Line) -> Boolean
const contiguous = line => lines => (
  line.number === lines[lines.length - 1].number + 1
);

const rewriteJs = sourceType => ({
  prefix,
  openingDelimiter,
  closingDelimiter,
}) => input => {
  // 1: Parse source text to extract comments
  const comments = [];
  acorn.parse (input, {
    ecmaVersion: 2023,
    sourceType,
    locations: true,
    onComment: comments,
  });

  // 2: Preserve source text between comments
  const chunks = [];
  {
    let offset = 0;
    for (const {start, end} of comments) {
      chunks.push ([offset, input.slice (offset, start)]);
      offset = end;
    }
    chunks.push ([offset, input.slice (offset)]);
  }

  // 3: Extract prefixed comment lines
  const lines = [];
  {
    const maybePushLine = (text, offset, number) => {
      if (text.startsWith (prefix)) {
        const unprefixed = (text.slice (prefix.length)).trimStart ();
        lines.push ([offset, Line (number) (unprefixed)]);
      }
    };
    for (const {type, value, start, loc} of comments) {
      if (type === 'Line') {
        maybePushLine (value, start, loc.start.line);
      } else {
        let offset = start;
        let number = loc.start.line;
        for (const text of value.split ('\n')) {
          maybePushLine (text.replace (/^\s*[*]/, ''), offset, number);
          offset += '\n'.length;
          number += 1;
        }
      }
    }
  }

  // 4: Coalesce related input and output lines
  const tests = [];
  {
    let test;
    let state = openingDelimiter == null ? 'open' : 'closed';
    for (const [offset, line] of lines) {
      if (state === 'closed') {
        if (line.text === openingDelimiter) state = 'open';
      } else if (line.text === closingDelimiter) {
        state = 'closed';
      } else if (line.text.startsWith ('>')) {
        tests.push ([offset, test = {input: {lines: [line]}}]);
        state = 'input';
      } else if (line.text.startsWith ('.')) {
        test[state].lines.push (line);
      } else if (state === 'input') {
        //  A comment immediately following an input line is an output
        //  line if and only if it contains non-whitespace characters.
        if (contiguous (line) (test.input.lines) && line.text !== '') {
          test.output = {lines: [line]};
          state = 'output';
        } else {
          state = 'open';
        }
      }
    }
  }

  // 5: Convert doctests to source text
  for (const [offset, test] of tests) {
    chunks.push ([offset, wrapJs (sourceType) (test)]);
  }

  // 6: Sort verbatim and generated source text by original offsets
  chunks.sort (([a], [b]) => a - b);

  // 7: Concatenate source text
  let sourceText = '';
  for (const [, text] of chunks) sourceText += text;
  return sourceText;
};

const rewriteCoffee = ({
  prefix: _prefix,
  openingDelimiter,
  closingDelimiter,
}) => input => {
  // 1a: Extract prefixed comment lines
  const lines = [];
  // 1b: Preserve other lines
  const chunks = [];
  {
    const prefix = '#' + _prefix;
    let number = 0;
    for (const [text, indent, rest] of input.matchAll (/^([ \t]*)(.*)\n?/gm)) {
      number += 1;
      if (rest.startsWith (prefix)) {
        const unprefixed = (rest.slice (prefix.length)).trimStart ();
        const line = Line (number) (unprefixed);
        lines.push ([indent, line]);
      } else {
        chunks.push ([number, text]);
      }
    }
  }

  // 2: Coalesce related input and output lines
  const tests = [];
  {
    let test;
    let state = openingDelimiter == null ? 'open' : 'closed';
    for (const [indent, line] of lines) {
      if (state === 'closed') {
        if (line.text === openingDelimiter) state = 'open';
      } else if (line.text === closingDelimiter) {
        state = 'closed';
      } else if (line.text.startsWith ('>')) {
        tests.push ([line.number, test = {indent, input: {lines: [line]}}]);
        state = 'input';
      } else if (line.text.startsWith ('.')) {
        test[state].lines.push (line);
      } else if (state === 'input') {
        //  A comment immediately following an input line is an output
        //  line if and only if it contains non-whitespace characters.
        if (contiguous (line) (test.input.lines) && line.text !== '') {
          test.output = {lines: [line]};
          state = 'output';
        } else {
          state = 'open';
        }
      }
    }
  }

  // 3: Convert doctests to source text
  for (const [number, test] of tests) {
    chunks.push ([number, wrapCoffee (test)]);
  }

  // 4: Sort verbatim and generated source text by original line numbers
  chunks.sort (([a], [b]) => a - b);

  // 5: Concatenate source text
  let sourceText = '';
  for (const [, text] of chunks) sourceText += text;
  return CoffeeScript.compile (sourceText);
};

const run = queue =>
  queue.flatMap (({input, output}) => {
    const i = encase (input.thunk) ();
    if (output == null) return [];
    const o = encase (output.thunk) ();
    const comparison = (
      effect (o => effect (i => i.name === o.name &&
                                i.message === (o.message || i.message) ?
                                Correct (Failure (i)) :
                                Incorrect (Failure (i)) (Failure (o)))
                          (i => Incorrect (Success (i)) (Failure (o))))
             (o => effect (i => Incorrect (Failure (i)) (Success (o)))
                          (i => Z.equals (i, o) ?
                                Correct (Success (i)) :
                                Incorrect (Success (i)) (Success (o))))
             (o)
             (i)
    );
    return [{lines: {input: input.lines, output: output.lines}, comparison}];
  });

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
  return run (queue);
};

const evaluateScript = context => async source => {
  const queue = [];
  const enqueue = io => { queue.push (io); };
  const __doctest = {enqueue, require};
  vm.runInNewContext (source, {...global, ...context, __doctest});
  return run (queue);
};

const log = tests => {
  console.log (
    tests
    .map (test => comparison (_ => _ => 'x') (_ => '.') (test.comparison))
    .join ('')
  );
  for (const test of tests) {
    comparison
      (actual => expected => {
         console.log (`FAIL: expected ${
           effect (x => `! ${x}`) (show) (expected)
         } on line ${
           test.lines.output[test.lines.output.length - 1].number
         } (got ${
           effect (x => `! ${x}`) (show) (actual)
         })`);
       })
      (_ => {})
      (test.comparison);
  }
};

const test = options => path => rewrite => async evaluate => {
  const originalSource = await fs.readFile (path, 'utf8');
  const modifiedSource = (
    rewrite ({prefix: options.prefix ?? '',
              openingDelimiter: options.openingDelimiter,
              closingDelimiter: options.closingDelimiter})
            (originalSource
             .replace (/\r\n?/g, '\n')
             .replace (/^#!.*/, ''))
  );
  if (options.print) {
    console.log (modifiedSource.replace (/\n$/, ''));
    return [];
  } else {
    const results = await evaluate (modifiedSource);
    if (!options.silent) {
      console.log (`running doctests in ${path}...`);
      log (results);
    }
    return results;
  }
};

export default options => async path => {
  const __filename = resolve (process.cwd (), path);
  let context = {};
  switch (options.module) {
    case 'esm': {
      return test (options)
                  (path)
                  (rewriteJs ('module'))
                  (evaluateModule (url.pathToFileURL (__filename)));
    }
    case 'commonjs': {
      const exports = {};
      const module = {exports};
      const __dirname = dirname (__filename);
      context = {process, exports, module, require, __dirname, __filename};
    } // fall through
    case undefined: {
      return test (options)
                  (path)
                  (options.coffee ? rewriteCoffee : rewriteJs ('script'))
                  (evaluateScript (context));
    }
    default: {
      throw new Error (`Invalid module ${show (options.module)}`);
    }
  }
  /* c8 ignore next */
};
