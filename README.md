# doctest

[Doctests][1] are executable usage examples sometimes found in "docstrings".
JavaScript doesn't have docstrings, but inline documentation can be included
in code comments. doctest executes usage examples in JavaScript/CoffeeScript
comments to verify that one's code and inline documentation are in agreement.

```coffeescript
# Math.product
# ------------
#
# Return the product of two or more numeric values:
#
#     > Math.product(-2, 2.5, "3")
#     -15
#
# `NaN` is returned if the values cannot all be coerced to numbers:
#
#     > Math.product(2, "ten")
#     NaN
#
# `undefined` is returned if no arguments are provided:
#
#     > Math.product()
#     undefined
#
Math.product = (nums...) ->
  prod = 1
  prod *= num for num in nums
  prod
```

Doctests needn't be indented, though there's no harm in being
[Docco-friendly][2].

### Running doctests

To run doctests, pass `doctest` the path to the "module" to be tested.
Doctests can be run from the command line or from a browser console: provide
local file system paths in the former case, URLs in the latter. Specifically,
each URL should be one of the following:

  - an absolute URL; e.g. `"http://example.com/scripts/some-module.js"`
  - a root-relative URL; e.g. `"/scripts/some-module.js"`
  - a path relative to doctest.js; e.g. `"./some-module.js"`

For example:

    > doctest("../src/math-extensions.coffee")
    retrieving /scripts/lib/../src/math-extensions.coffee...
    running doctests in math-extensions.coffee...
    ..x
    expected undefined on line 17 (got 1)

Oops. Looks like we have a disagreement.

### AMD and CommonJS modules

doctest partially supports AMD and CommonJS modules:

| Module system               | Node.js | Browser |
| --------------------------- |:-------:|:-------:|
| AMD                         |    ✔︎    |    ✔︎    |
| AMD w/ dependencies         |    ✘    |    ✘    |
| CommonJS                    |    ✔︎    |    ✘    |
| CommonJS w/ dependencies    |    ✔︎    |    ✘    |

Specify module system via JavaScript API:

    > doctest("path/to/amd/module.js", {module: "amd"})

Specify module system via command-line interface:

    $ doctest --module commonjs path/to/commonjs/module.js

### Errors

It's easy to indicate that an error (of a particular kind) is expected:

    // > null.length
    // TypeError

### Scoping

doctest doesn't use a parser; it treats JavaScript files as lines of text.
In spite of this, each doctest has access to variables in its scope chain:

```javascript
!function() {

  var x = 6
  var y = 7
  // > x * y
  // 42

}()
```

It's even possible to reference variables that have not yet been defined:

```javascript
!function() {

  // > toUsername("Jesper Nøhr")
  // "jespernhr"
  // > toUsername(15 * 15)
  // "225"
  var toUsername = function(text) {
    return ('' + text).replace(/\W/g, '').toLowerCase()
  }

}()
```

It's important to be familiar with the hack doctest employs to achieve this,
since it places constraints on where doctests may appear in a file.

Once doctest has retrieved a file via XMLHttpRequest, three things happen:

1.  Input lines (single-line comments beginning with ">") and associated
    output lines are rewritten as executable code (calls to `doctest.input`
    and `doctest.output`, specifically).

2.  The rewritten file is eval'd.

3.  `doctest.run` is called, invoking functions queued in the previous step.

In the first step, the code example above would be rewritten as:

```javascript
!function() {

  doctest.input(function() {
    return toUsername("Jesper Nøhr")
  });
  doctest.output(4, function() {
    return "jespernhr"
  });
  doctest.input(function() {
    return 15 * 15
  });
  doctest.output(6, function() {
    return "225"
  });
  var toUsername = function(text) {
    return ('' + text).replace(/\W/g, '').toLowerCase()
  }

}()
```

The naive nature of the rewriter prevents this from working:

```javascript
MyApp.utils = {
  // > MyApp.utils.foo()
  // "foo"
  foo: function() {
    return 'foo'
  },
  // > MyApp.utils.bar()
  // "bar"
  bar: function() {
    return 'bar'
  }
}
```

The code could be restructured to accommodate the rewriter:

```javascript
MyApp.utils = {}

// > MyApp.utils.foo()
// "foo"
MyApp.utils.foo = function() {
  return 'foo'
}

// > MyApp.utils.bar()
// "bar"
MyApp.utils.bar = function() {
  return 'bar'
}
```

### Running the test suite

    $ make setup
    $ make test

This runs doctest's test suite in Node. To run the suite in a browser, first
start an HTTP server with __test/public__ as the root. For example:

    $ cd test/public
    $ python -m SimpleHTTPServer
    Serving HTTP on 0.0.0.0 port 8000 ...

Then point a browser at the correct port on localhost to view the results.


[1]: http://docs.python.org/library/doctest.html
[2]: http://bit.ly/129sbLQ
