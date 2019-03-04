
///          >>>
///          >>>                        >>>                         >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
///    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
///    .....................x.......xx.x.................................

'use strict';

var fs = require ('fs');
var pathlib = require ('path');

var CoffeeScript = require ('coffeescript');
var esprima = require ('esprima');
var _show = require ('sanctuary-show');
var Z = require ('sanctuary-type-classes');


function inferType(path) {
  switch (pathlib.extname (path)) {
    case '.coffee': return 'coffee';
    case '.js':     return 'js';
    default:        throw new Error ('Cannot infer type from extension');
  }
}

var rewriters = {coffee: rewrite$coffee, js: rewrite$js};

function evaluate(moduleType, source, path) {
  return moduleType === 'commonjs' ?
    commonjsEval (source, path) :
    functionEval (source);
}

module.exports = function(path, options) {
  if (options.module != null &&
      options.module !== 'amd' &&
      options.module !== 'commonjs') {
    throw new Error ('Invalid module `' + options.module + "'");
  }
  if (options.type != null &&
      options.type !== 'coffee' &&
      options.type !== 'js') {
    throw new Error ('Invalid type `' + options.type + "'");
  }

  var source = toModule (
    rewriters[options.type == null ? inferType (path) : options.type] (
      options.prefix == null ? '' : options.prefix,
      fs.readFileSync (path, 'utf8')
        .replace (/\r\n?/g, '\n')
        .replace (/^#!.*/, '')
    ),
    options.module
  );

  if (options.print) {
    console.log (source.replace (/\n$/, ''));
    return [];
  } else if (options.silent) {
    return evaluate (options.module, source, path);
  } else {
    console.log ('running doctests in ' + path + '...');
    var results = evaluate (options.module, source, path);
    log (results);
    return results;
  }
};

//  indentN :: (Integer, String) -> String
function indentN(n, s) {
  return s.replace (/^(?!$)/gm, (Array (n + 1)).join (' '));
}

//  matchLine :: (String, String) -> Nullable (Array3 String String String)
function matchLine(prefix, s) {
  return s.slice (0, prefix.length) === prefix ?
    (s.slice (prefix.length)).match (/^\s*(>|[.]*)[ ]?(.*)$/) :
    null;
}

//  quote :: String -> String
function quote(s) {
  return "'" + s.replace (/'/g, "\\'") + "'";
}

//  show :: a -> String
function show(x) {
  return Object.prototype.toString.call (x) === '[object Error]' ?
    String (x) :
    _show (x);
}

//  unlines :: Array String -> String
function unlines(lines) {
  return lines.reduce (function(s, line) { return s + line + '\n'; }, '');
}

//  iifeWrap :: String -> String
function iifeWrap(s) {
  return 'void function() {\n' + indentN (2, s) + '}.call(this);';
}

//  toModule :: (String, String?) -> String
function toModule(source, moduleType) {
  switch (moduleType) {
    case 'amd':
      return unlines ([
        source,
        'function define() {',
        '  for (var idx = 0; idx < arguments.length; idx += 1) {',
        '    if (typeof arguments[idx] == "function") {',
        '      arguments[idx]();',
        '      break;',
        '    }',
        '  }',
        '}'
      ]);
    case 'commonjs':
      return iifeWrap (unlines ([
        'var __doctest = {',
        '  require: require,',
        '  queue: [],',
        '  enqueue: function(io) { this.queue.push(io); }',
        '};',
        '',
        iifeWrap (source),
        '',
        '(module.exports || exports).__doctest = __doctest;'
      ]));
    default:
      return source;
  }
}

//  normalizeTest :: { output :: { value :: String } } -> Undefined
function normalizeTest($test) {
  var $output = $test.output;
  if ($output != null) {
    var match = $output.value.match (/^![ ]?([^:]*)(?::[ ]?(.*))?$/);
    $test['!'] = match != null;
    if ($test['!']) {
      $output.value = 'new ' + match[1] + '(' + quote (match[2] || '') + ')';
    }
  }
}

var INPUT = 'input';
var OUTPUT = 'output';
var DEFAULT = 'default';

//  Location = { start :: { line :: Integer, column :: Integer }
//             ,   end :: { line :: Integer, column :: Integer } }

//  transformComments
//  :: ( String
//      , Array { type :: String, value :: String, loc :: Location } )
//  -> Array { commentIndex :: Integer
//           ,            ! :: Boolean
//           ,        input :: { value :: String, loc :: Location }
//           ,       output :: { value :: String, loc :: Location } }
//
//  Returns the doctests present in the given esprima comment objects.
//
//  > transformComments ('', [{
//  .   type: 'Line',
//  .   value: ' > 6 * 7',
//  .   loc: {start: {line: 1, column: 0}, end: {line: 1, column: 10}}
//  . }, {
//  .   type: 'Line',
//  .   value: ' 42',
//  .   loc: {start: {line: 2, column: 0}, end: {line: 2, column: 5}}
//  . }])
//  [{
//  .   commentIndex: 1,
//  .   '!': false,
//  .   input: {
//  .     value: '6 * 7',
//  .     loc: {start: {line: 1, column: 0}, end: {line: 1, column: 10}}},
//  .   output: {
//  .     value: '42',
//  .     loc: {start: {line: 2, column: 0}, end: {line: 2, column: 5}}}
//  . }]
function transformComments(prefix, comments) {
  var result = comments.reduce (function(accum, comment, commentIndex) {
    return (comment.value.split ('\n')).reduce (function(accum, line, idx) {
      var normalizedLine, start, end;
      if (comment.type === 'Block') {
        normalizedLine = line.replace (/^\s*[*]?\s*/, '');
        start = end = {line: comment.loc.start.line + idx};
      } else if (comment.type === 'Line') {
        normalizedLine = line.replace (/^\s*/, '');
        start = comment.loc.start;
        end = comment.loc.end;
      }

      var match = matchLine (prefix, normalizedLine);
      if (match != null) {
        var $1 = match[1];
        var $2 = match[2];
        if ($1 === '>') {
          accum.state = INPUT;
          accum.tests.push ({
            commentIndex: commentIndex,
            input: {value: $2, loc: {start: start, end: end}}
          });
        } else if ($1 !== '' || accum.state === INPUT) {
          var last = accum.tests[accum.tests.length - 1];
          last.commentIndex = commentIndex;
          if ($1 !== '') {
            last[accum.state].value += '\n' + $2;
            last[accum.state].loc.end = end;
          } else {
            accum.state = OUTPUT;
            last[accum.state] = {value: $2, loc: {start: start, end: end}};
          }
        } else {
          accum.state = DEFAULT;
        }
      }
      return accum;
    }, accum);
  }, {state: DEFAULT, tests: []});

  var $tests = result.tests;
  $tests.forEach (normalizeTest);
  return $tests;
}

//  substring
//  :: ( String
//     , { line :: Integer, column :: Integer }
//     , { line :: Integer, column :: Integer } )
//  -> String
//
//  Returns the substring between the start and end positions.
//  Positions are specified in terms of line and column rather than index.
//  {line: 1, column: 0} represents the first character of the first line.
//
//  > substring ('hello\nworld', {line: 1, column: 3}, {line: 2, column: 2})
//  'lo\nwo'
//  > substring ('hello\nworld', {line: 1, column: 0}, {line: 1, column: 0})
//  ''
function substring(input, start, end) {
  var lines = input.split (/^/m);
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
}

function wrap$js(test) {
  var type = (esprima.parse (test.input.value)).body[0].type;
  return type === 'FunctionDeclaration' || type === 'VariableDeclaration' ?
    test.input.value :
    [
      '__doctest.enqueue({',
      '  type: "input",',
      '  thunk: function() {',
      '    return ' + test.input.value + ';',
      '  }',
      '});'
    ].concat (test.output == null ? [] : [
      '__doctest.enqueue({',
      '  type: "output",',
      '  ":": ' + test.output.loc.start.line + ',',
      '  "!": ' + test['!'] + ',',
      '  thunk: function() {',
      '    return ' + test.output.value + ';',
      '  }',
      '});'
    ]).join ('\n');
}

function wrap$coffee(test) {
  return [
    '__doctest.enqueue {',
    '  type: "input"',
    '  thunk: ->',
    indentN (4, test.input.value),
    '}'
  ].concat (test.output == null ? [] : [
    '__doctest.enqueue {',
    '  type: "output"',
    '  ":": ' + test.output.loc.start.line,
    '  "!": ' + test['!'],
    '  thunk: ->',
    indentN (4, test.output.value),
    '}'
  ]).join ('\n');
}

function rewrite$js(prefix, input) {
  //  1. Locate block comments and line comments within the input text.
  //
  //  2. Create a list of comment chunks from the list of line comments
  //     located in step 1 by grouping related comments.
  //
  //  3. Create a list of code chunks from the remaining input text.
  //     Note that if there are N comment chunks there are N + 1 code
  //     chunks. A trailing empty comment enables the final code chunk
  //     to be captured:

  var bookend = {
    value: '',
    loc: {start: {line: Infinity, column: Infinity}}
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

  function getComments(input) {
    return (esprima.parse (input, {comment: true, loc: true})).comments;
  }

  //  comments :: { Block :: Array Comment, Line :: Array Comment }
  var comments = (getComments (input)).reduce (function(comments, comment) {
    comments[comment.type].push (comment);
    return comments;
  }, {Block: [], Line: []});

  var blockTests = transformComments (prefix, comments.Block);
  var lineTests = transformComments (prefix, comments.Line);

  var chunks = lineTests
    .concat ([{input: bookend}])
    .reduce (function(accum, test) {
      accum.chunks.push (substring (input, accum.loc, test.input.loc.start));
      accum.loc = (test.output == null ? test.input : test.output).loc.end;
      return accum;
    }, {chunks: [], loc: {line: 1, column: 0}})
    .chunks;

  //  source :: String
  var source = lineTests
    .map (wrap$js)
    .concat ([''])
    .reduce (function(accum, s, idx) { return accum + chunks[idx] + s; }, '');

  return getComments (source)
    .filter (function(comment) { return comment.type === 'Block'; })
    .concat ([bookend])
    .reduce (function(accum, comment, idx) {
      accum.chunks.push (
        substring (source, accum.loc, comment.loc.start),
        blockTests
          .filter (function(test) { return test.commentIndex === idx; })
          .map (wrap$js)
          .join ('\n')
      );
      accum.loc = comment.loc.end;
      return accum;
    }, {chunks: [], loc: {line: 1, column: 0}})
    .chunks
    .join ('');
}

function rewrite$coffee(prefix, input) {
  var lines = input.match (/^.*(?=\n)/gm);
  var chunks = lines.reduce (function(accum, line, idx) {
    var isComment = /^[ \t]*#(?!##)/.test (line);
    var current = isComment ? accum.commentChunks : accum.literalChunks;
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
    isComment: false
  });

  var testChunks = chunks.commentChunks.map (function(commentChunk) {
    var result = commentChunk.lines.reduce (function(accum, line, idx) {
      var fullMatch = line.match (/^([ \t]*)#[ \t]*(.*)$/);
      var indent = fullMatch[1];
      var match = matchLine (prefix, fullMatch[2]);
      if (match != null) {
        var $1 = match[1];
        var $2 = match[2];
        if ($1 === '>') {
          accum.state = INPUT;
          accum.tests.push ({indent: indent, input: {value: $2}});
        } else if ($1 !== '' || accum.state === INPUT) {
          var last = accum.tests[accum.tests.length - 1];
          if ($1 !== '') {
            last[accum.state].value += '\n' + $2;
          } else {
            accum.state = OUTPUT;
            last[accum.state] = {
              value: $2,
              loc: {start: {line: commentChunk.loc.start.line + idx}}
            };
          }
        } else {
          accum.state = DEFAULT;
        }
      }
      return accum;
    }, {state: DEFAULT, tests: []});

    return result.tests.map (function($test) {
      normalizeTest ($test);
      return indentN ($test.indent.length, wrap$coffee ($test));
    });
  });

  function append(s, line) { return s + line + '\n'; }
  return CoffeeScript.compile (
    chunks.literalChunks.reduce (function(s, chunk, idx) {
      return (testChunks[idx] || []).reduce (
        append,
        chunk.lines.reduce (append, s)
      );
    }, '')
  );
}

function functionEval(source) {
  //  Functions created via the Function function are always run in the
  //  global context, which ensures that doctests can't access variables
  //  in _this_ context.
  //
  //  The `evaluate` function takes one argument, named `__doctest`.
  var evaluate = Function ('__doctest', source);
  var queue = [];
  evaluate ({enqueue: function(io) { queue.push (io); }});
  return run (queue);
}

function commonjsEval(source, path) {
  var abspath =
  (pathlib.resolve (path)).replace (/[.][^.]+$/, '-' + Date.now () + '.js');

  fs.writeFileSync (abspath, source);
  var queue;
  try {
    queue = (require (abspath)).__doctest.queue;
  } finally {
    fs.unlinkSync (abspath);
  }
  return run (queue);
}

function run(queue) {
  return queue.reduce (function(accum, io) {
    var thunk = accum.thunk;
    if (io.type === INPUT) {
      if (thunk != null) thunk ();
      accum.thunk = io.thunk;
    } else if (io.type === OUTPUT) {
      var either;
      try {
        either = {tag: 'Right', value: thunk ()};
      } catch (err) {
        either = {tag: 'Left', value: err};
      }
      accum.thunk = null;
      var expected = io.thunk ();

      var pass, repr;
      if (either.tag === 'Left') {
        var name = either.value.name;
        var message = either.value.message;
        pass = io['!'] &&
               name === expected.name &&
               message === expected.message.replace (/^$/, message);
        repr = '! ' + name +
               (expected.message && message.replace (/^(?!$)/, ': '));
      } else {
        pass = !io['!'] && Z.equals (either.value, expected);
        repr = show (either.value);
      }

      accum.results.push ([
        pass,
        repr,
        io['!'] ?
          '! ' + expected.name + expected.message.replace (/^(?!$)/, ': ') :
          show (expected),
        io[':']
      ]);
    }
    return accum;
  }, {results: [], thunk: null}).results;
}

function log(results) {
  console.log (results.reduce (function(s, tuple) {
    return s + (tuple[0] ? '.' : 'x');
  }, ''));
  results.forEach (function(tuple) {
    if (!tuple[0]) {
      console.log ('FAIL: expected ' + tuple[2] + ' on line ' + tuple[3] +
                   ' (got ' + tuple[1] + ')');
    }
  });
}
