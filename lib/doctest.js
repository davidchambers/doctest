
///          >>>
///          >>>                        >>>                         >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>   >>>>>   >>>>>>>    >>>>>>   >>>>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>   >>>  >>>       >>>
///    >>>   >>>  >>>   >>>  >>>        >>>    >>>>>>>>>  >>>>>>>>  >>>
///    >>>   >>>  >>>   >>>  >>>   >>>  >>>    >>>             >>>  >>>
///     >>>>>>>>   >>>>>>>    >>>>>>>    >>>>   >>>>>>>    >>>>>>    >>>>
///    .....................x.......xx.x.................................

;(function(global) {

  'use strict';

  /* global console, module, require */

  var doctest = function(path, options, callback) {
    if (options == null) {
      options = {};
    }
    if (callback == null) {
      callback = noop;
    }

    var validateOption = function(name, validValues) {
      if (R.has(name, options) && !R.contains(options[name], validValues)) {
        throw new Error('Invalid ' + name + ' `' + options[name] + "'");
      }
    };

    validateOption('module', ['amd', 'commonjs']);
    validateOption('type', ['coffee', 'js']);

    options = R.merge({
      path: path,
      silent: Boolean(options.silent)
    }, options);

    if (!options.type) {
      options.type = (function() {
        var match = R.match(/[.](coffee|js)$/, path);
        if (R.isEmpty(match)) {
          throw new Error('Cannot infer type from extension');
        }
        return match[1];
      }());
    }

    return fetch(path, options, function(text) {
      return doctest.string(text, options, callback);
    });
  };


  var CoffeeScript, R, esprima;
  if (typeof window !== 'undefined') {
    CoffeeScript = global.CoffeeScript;
    esprima = global.esprima;
    R = global.R;
    global.doctest = doctest;
  } else {
    var fs = require('fs');
    var pathlib = require('path');
    CoffeeScript = require('coffee-script');
    esprima = require('esprima');
    R = require('ramda');
    module.exports = doctest;
  }


  doctest.string = function(text, options, callback) {
    if (typeof options !== 'object') {
      callback = options;
      options = {};
    }
    callback = callback || noop;

    options = R.merge({
      type: 'js',
      silent: true
    }, options);

    var source = toModule(rewrite(text, options.type), options.module);
    if (options.print) {
      if (!options.silent) {
        console.log(R.replace(/\n$/, '', source));
      }
      callback(source);
      return source;
    } else {
      var results = options.module === 'commonjs' ?
            commonjsEval(source, options.path) :
            functionEval(source);
      if (!options.silent) {
        log(results);
      }
      callback(results);
      return results;
    }
  };


  var _ = R.__;

  //  appendTo :: [a] -> a -> [a]
  var appendTo = R.flip(R.append);

  //  compose :: (b -> c) -> (a -> b) -> (a -> c)
  var compose = R.curryN(2, R.compose);

  //  fromMaybe :: a -> [a] -> a
  var fromMaybe = R.curry(function(x, maybe) {
    return R.isEmpty(maybe) ? x : maybe[0];
  });

  //  indentN :: Number -> String -> String
  var indentN = R.curry(function(n, s) {
    return R.replace(/^(?!$)/gm, Array(n + 1).join(' '), s);
  });

  //  joinLines :: [String] -> String
  var joinLines = R.join('\n');

  //  noop :: * -> ()
  var noop = function() {};

  //  quote :: String -> String
  var quote = function(s) {
    return "'" + (R.replace(/'/g, "\\'", s)) + "'";
  };

  //  reduce :: a -> (a,b,Number,[b] -> a) -> [b] -> a
  var reduce = R.flip(R.addIndex(R.reduce));


  //  unlines :: [String] -> String
  var unlines = R.compose(R.join(''), R.map(R.concat(R.__, '\n')));


  var fetch = function(path, options, callback) {
    var silent = options.silent || options.print;
    var wrapper = function(text) {
      var name = R.last(R.split('/', path));
      if (!silent) {
        console.log('running doctests in ' + name + '...');
      }
      return callback(text);
    };
    if (!silent) {
      console.log('retrieving ' + path + '...');
    }
    return typeof window !== 'undefined' ?
      global.jQuery.ajax(path, {dataType: 'text', success: wrapper}) :
      wrapper(fs.readFileSync(path, 'utf8'));
  };


  var rewrite = function(input, type) {
    return rewrite[type](input.replace(/\r\n?/g, '\n').replace(/^#!.*/, ''));
  };


  //  toModule :: String,String? -> String
  var toModule = function(source, moduleType) {
    switch (moduleType) {
      case 'amd':
        return unlines([
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
        var iifeWrap = function(s) {
          return 'void function() {\n' + indentN(2, s) + '}.call(this);';
        };
        return iifeWrap(unlines([
          'var __doctest = {',
          '  queue: [],',
          '  enqueue: function(io) { this.queue.push(io); }',
          '};',
          '',
          iifeWrap(source),
          '',
          '(module.exports || exports).__doctest = __doctest;'
        ]));
      default:
        return source;
    }
  };


  //  normalizeTest :: { output :: { value :: String } } ->
  //                     { ! :: Boolean, output :: { value :: String } }
  var normalizeTest = R.converge(
    R.call,
    R.pipe(R.of,
           R.filter(R.has('output')),
           R.map(R.prop('output')),
           R.map(R.prop('value')),
           R.map(R.match(/^![ ]?([^:]*)(?::[ ]?(.*))?$/)),
           R.map(R.ifElse(R.isEmpty,
                          R.always(R.assoc('!', false)),
                          R.converge(R.pipe(function(type, message) {
                                              return 'new ' + type +
                                                     '(' + message + ')';
                                            },
                                            R.assocPath(['output', 'value']),
                                            compose(R.assoc('!', true))),
                                     R.nth(1),
                                     R.pipe(R.nth(2),
                                            R.of,
                                            R.reject(R.isNil),
                                            R.map(quote),
                                            fromMaybe(''))))),
           fromMaybe(R.identity)),
    R.identity
  );


  var _commentIndex = R.lensProp('commentIndex');
  var _end          = R.lensProp('end');
  var _input        = R.lensProp('input');
  var _loc          = R.lensProp('loc');
  var _output       = R.lensProp('output');
  var _value        = R.lensProp('value');
  var _1            = R.lensIndex(0);
  var _2            = R.lensIndex(1);

  _2._last = R.compose(_2, R.lens(R.last, function(x, xs) {
    return R.update(xs.length - 1, x, xs);
  }));

  _2._last.commentIndex   = R.compose(_2._last, _commentIndex);
  _2._last.output         = R.compose(_2._last, _output);
  _2._last.output.loc     = R.compose(_2._last.output, _loc);
  _2._last.output.loc.end = R.compose(_2._last.output.loc, _end);
  _2._last.output.value   = R.compose(_2._last.output, _value);
  _2._last.input          = R.compose(_2._last, _input);
  _2._last.input.loc      = R.compose(_2._last.input, _loc);
  _2._last.input.loc.end  = R.compose(_2._last.input.loc, _end);
  _2._last.input.value    = R.compose(_2._last.input, _value);


  //  transformComments :: [Object] -> [Object]
  //
  //  Returns a list of {input,output} pairs representing the doctests
  //  present in the given list of esprima comment objects.
  //
  // > transformComments([{
  // .   type: 'Line',
  // .   value: ' > 6 * 7',
  // .   loc: {start: {line: 1, column: 0}, end: {line: 1, column: 10}}
  // . }, {
  // .   type: 'Line',
  // .   value: ' 42',
  // .   loc: {start: {line: 2, column: 0}, end: {line: 2, column: 5}}
  // . }])
  // [{
  // .   commentIndex: 1,
  // .   '!': false,
  // .   input: {
  // .     value: '6 * 7',
  // .     loc: {start: {line: 1, column: 0}, end: {line: 1, column: 10}}},
  // .   output: {
  // .     value: '42',
  // .     loc: {start: {line: 2, column: 0}, end: {line: 2, column: 5}}}
  // . }]
  var transformComments = R.pipe(
    reduce(['default', []], function(accum, comment, commentIndex) {
      return R.pipe(
        R.prop('value'),
        R.split('\n'),
        reduce(accum, function(accum, line, idx) {
          var normalizedLine, start, end;
          if (comment.type === 'Block') {
            normalizedLine = R.replace(/^\s*[*]?\s*/, '', line);
            start = end = {line: comment.loc.start.line + idx};
          } else if (comment.type === 'Line') {
            normalizedLine = R.replace(/^\s*/, '', line);
            start = comment.loc.start;
            end = comment.loc.end;
          }

          var match = R.match(/^(>|[.]*)[ ]?(.*)$/, normalizedLine);
          return (
            match[1] === '>' ?
              R.pipe(R.set(_1, 'input'),
                     R.over(_2, R.append({})),
                     R.set(_2._last.commentIndex, commentIndex),
                     R.set(_2._last.input,
                           {loc: {start: start, end: end}, value: match[2]})) :
            match[1] ?
              R.pipe(R.set(_2._last.commentIndex, commentIndex),
                     R.set(_2._last[accum[0]].loc.end, end),
                     R.over(_2._last[accum[0]].value,
                            R.concat(_, '\n' + match[2]))) :
            accum[0] === 'input' ?
              R.pipe(R.set(_1, 'output'),
                     R.set(_2._last.commentIndex, commentIndex),
                     R.set(_2._last.output,
                           {loc: {start: start, end: end}, value: match[2]})) :
            // else
              R.set(_1, 'default')
          )(accum);
        })
      )(comment);
    }),
    R.last,
    R.map(normalizeTest)
  );


  //  substring :: String,{line,column},{line,column} -> String
  //
  //  Returns the substring between the start and end positions.
  //  Positions are specified in terms of line and column rather than index.
  //  {line: 1, column: 0} represents the first character of the first line.
  //
  //  > substring('hello\nworld', {line: 1, column: 3}, {line: 2, column: 2})
  //  'lo\nwo'
  //  > substring('hello\nworld', {line: 1, column: 0}, {line: 1, column: 0})
  //  ''
  var substring = function(input, start, end) {
    return start.line === end.line && start.column === end.column ?
      '' :
      R.pipe(
        R.split(/^/m),
        reduce(['', false], function(accum, line, idx) {
          var isStartLine = idx + 1 === start.line;
          var isEndLine = idx + 1 === end.line;
          return R.pipe(
            R.split(''),
            reduce(['', R.last(accum)], function(accum, chr, column) {
              return isStartLine && column === start.column ||
                     accum[1] && !(isEndLine && column === end.column) ?
                [R.concat(accum[0], chr), true] :
                [accum[0], false];
            }),
            R.converge(R.prepend,
                       R.pipe(R.head, R.concat(R.head(accum))),
                       R.tail)
          )(line);
        }),
        R.head
      )(input);
  };


  var wrap = R.curry(function(type, test) {
    return R.pipe(R.filter(R.has(_, test)), R.map(function(dir) {
      return wrap[type][dir](test);
    }), joinLines)(['input', 'output']);
  });

  wrap.js = wrap('js');

  wrap.js.input = function(test) {
    return joinLines([
      '__doctest.enqueue({',
      '  type: "input",',
      '  thunk: function() {',
      '    return ' + test.input.value + ';',
      '  }',
      '});'
    ]);
  };

  wrap.js.output = function(test) {
    return joinLines([
      '__doctest.enqueue({',
      '  type: "output",',
      '  ":": ' + test.output.loc.start.line + ',',
      '  "!": ' + test['!'] + ',',
      '  thunk: function() {',
      '    return ' + test.output.value + ';',
      '  }',
      '});'
    ]);
  };

  wrap.coffee = wrap('coffee');

  wrap.coffee.input = function(test) {
    return joinLines([
      '__doctest.enqueue {',
      '  type: "input"',
      '  thunk: ->',
      indentN(4, test.input.value),
      '}'
    ]);
  };

  wrap.coffee.output = function(test) {
    return joinLines([
      '__doctest.enqueue {',
      '  type: "output"',
      '  ":": ' + test.output.loc.start.line,
      '  "!": ' + test['!'],
      '  thunk: ->',
      indentN(4, test.output.value),
      '}'
    ]);
  };


  rewrite.js = function(input) {
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
    //  5. Zip the lists produced by steps 3 and 4; flatten; and join.
    //
    //  6. Find block comments in the source code produced by step 5.
    //     (The locations of block comments located in step 1 are not
    //     applicable to the rewritten source.)
    //
    //  7. Repeat steps 3 through 5 for the list of block comments
    //     produced by step 6 (substituting "step 6" for "step 2").

    var getComments =
    R.pipe(R.partialRight(esprima.parse, {comment: true, loc: true}),
           R.prop('comments'));

    //  tests :: { blockTests :: [Test], lineTests :: [Test] }
    var tests = R.pipe(
      getComments,
      R.partition(R.propEq('type', 'Block')),
      R.map(transformComments),
      R.zipObj(['blockTests', 'lineTests'])
    )(input);

    //  source :: String
    var source = R.pipe(
      R.append({input: bookend}),
      reduce([[], {line: 1, column: 0}], function(accum, test) {
        return [
          appendTo(accum[0], substring(input, accum[1], test.input.loc.start)),
          R.defaultTo(test.input, test.output).loc.end
        ];
      }),
      R.head,
      R.zip(_, R.append('', R.map(wrap.js, tests.lineTests))),
      R.flatten,
      R.join('')
    )(tests.lineTests);

    return R.pipe(
      getComments,
      R.filter(R.propEq('type', 'Block')),
      R.append(bookend),
      reduce([[], {line: 1, column: 0}], function(accum, comment, idx) {
        return R.pipe(
          R.filter(R.propEq('commentIndex', idx)),
          R.map(wrap.js),
          joinLines,
          appendTo(R.append(substring(source, accum[1], comment.loc.start),
                            accum[0])),
          R.of,
          R.append(comment.loc.end)
        )(tests.blockTests);
      }),
      R.head,
      R.join('')
    )(source);
  };

  rewrite.coffee = function(input) {
    var chunks = R.pipe(
      R.match(/^.*(?=\n)/gm),
      R.addIndex(R.reduce)(function(accum, line, idx) {
        var literalChunks = accum[0];
        var commentChunks = accum[1];
        var inCommentChunk = accum[2];
        var isComment = R.test(/^[ \t]*#(?!##)/, line);
        var current = isComment ? commentChunks : literalChunks;
        if (isComment === inCommentChunk) {
          current[current.length - 1].lines.push(line);
        } else {
          current[current.length] = {
            lines: [line],
            loc: {start: {line: idx + 1}}
          };
        }
        return [literalChunks, commentChunks, isComment];
      }, [[{lines: [], loc: {start: {line: 1}}}], [], false]),
      R.zipObj(['literalChunks', 'commentChunks'])
    )(input);

    var matchLine = R.match(/^([ \t]*)#[ \t]*(>|[.]*)[ ]?(.*)$/);
    var testChunks = R.map(R.pipe(
      function(commentChunk) {
        return R.pipe(
          R.prop('lines'),
          reduce(['default', []], function(accum, line, idx) {
            var state = accum[0];
            var tests = accum[1];
            var match = R.tail(matchLine(line));
            var indent = match[0];
            var prefix = match[1];
            var value = match[2];
            if (prefix === '>') {
              tests[tests.length] = {indent: indent, input: {value: value}};
              return ['input', tests];
            } else if (prefix) {
              tests[tests.length - 1][state].value += '\n' + value;
              return [state, tests];
            } else if (state === 'input') {
              tests[tests.length - 1].output = {
                loc: {start: {line: commentChunk.loc.start.line + idx}},
                value: value
              };
              return ['output', tests];
            } else {
              return ['default', tests];
            }
          })
        )(commentChunk);
      },
      R.last,
      R.map(normalizeTest),
      R.map(R.converge(indentN, R.path(['indent', 'length']), wrap.coffee)),
      joinLines
    ), chunks.commentChunks);

    return CoffeeScript.compile(joinLines(R.flatten(R.zip(
      R.map(R.compose(joinLines, R.prop('lines')), chunks.literalChunks),
      R.append('', testChunks)
    ))));
  };

  var functionEval = function(source) {
    //  Functions created via the Function function are always run in the
    //  global context, which ensures that doctests can't access variables
    //  in _this_ context.
    //
    //  The `evaluate` function takes one argument, named `__doctest`.
    var evaluate = Function('__doctest', source);  // jshint ignore:line
    var queue = [];
    evaluate({enqueue: function(io) { return queue.push(io); }});
    return run(queue);
  };

  var commonjsEval = function(source, path) {
    var abspath =
    pathlib.resolve(path).replace(/[.][^.]+$/, '-' + Date.now() + '.js');

    fs.writeFileSync(abspath, source);
    var queue;
    try {
      queue = require(abspath).__doctest.queue;
    } finally {
      fs.unlinkSync(abspath);
    }
    return run(queue);
  };

  var run = function(queue) {
    var results = [];
    var thunks = [];  // thunks :: Maybe (() -> *)
    R.forEach(function(io) {
      if (io.type === 'input') {
        R.forEach(R.call, thunks);
        thunks = [io.thunk];
      } else if (io.type === 'output') {
        var actual;
        var throws = false;
        try {
          actual = R.head(R.map(R.call, thunks));
        } catch (err) {
          actual = err;
          throws = true;
        }
        var expected = io.thunk();

        var format = function(err) {
          return expected.message && err.message ?
            '! ' + err.name + ': ' + err.message :
            '! ' + err.name;
        };

        results.push([
          throws === io['!'] &&
          (R.is(Error, actual) ?
             actual.constructor === expected.constructor &&
             (throws && !expected.message ||
              actual.message === expected.message) :
           // else
             R.equals(actual, expected)),
          (throws ? format : R.toString)(actual),
          (io['!'] ? format : R.toString)(expected),
          io[':']
        ]);
        thunks = [];
      }
    }, queue);
    return results;
  };

  var log =
  R.converge(noop,
             R.pipe(R.map(R.ifElse(R.head, R.always('.'), R.always('x'))),
                    R.join(''),
                    R.bind(console.log, console)),
             R.pipe(R.reject(R.head),
                    R.forEach(R.apply(function(pass, actual, expected, num) {
                      console.log('FAIL: expected ' + expected +
                                  ' on line ' + num + ' (got ' + actual + ')');
                    }))));

}.call(this, this));
