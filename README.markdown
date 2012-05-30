# doctest

A quick and (very) dirty implementation of JavaScript [doctests][1] (which are
occasionally very useful).

```javascript
// > Math.product(3, 4, 5)
// 60
// > Math.product(2, "ten")
// NaN
// > Math.product(6)
// undefined
Math.product = function() {
  var idx = arguments.length
  if (idx) {
    var product = arguments[0]
    while (--idx) product *= arguments[idx]
    return product
  }
}
```

To run doctests, pass `doctest` paths to one or more "modules" to be tested.
Each path should be one of the following:

  - an absolute URL; e.g. "http://example.com/scripts/math-extensions.js"
  - a root-relative URL; e.g. "/scripts/math-extensions.js"
  - a path relative to doctest.js; e.g. "./math-extensions.js"

This can easily be done from a browser console:

    > doctest("./math-extensions.js")
    retrieving /scripts/./math-extensions.js...
    running doctests in math-extensions.js...
    ..x
    expected undefined on line 7 (got 6)

Oops. Looks like we have a bug.

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
  // MyApp.utils.foo()
  // "foo"
  foo: function() {
    return 'foo'
  },
  // MyApp.utils.bar()
  // "bar"
  bar: function() {
    return 'bar'
  }
}
```

The code could be restructured to accommodate the rewriter:

```javascript
MyApp.utils = {}

// MyApp.utils.foo()
// "foo"
MyApp.utils.foo = function() {
  return 'foo'
}

// MyApp.utils.bar()
// "bar"
MyApp.utils.bar = function() {
  return 'bar'
}
```

### Dependencies

  - [jQuery][2]
  - [Underscore][3]

### Running the test suite

    npm install express
    node test/server

Visit [localhost:3000](http://localhost:3000/).


[1]: http://docs.python.org/library/doctest.html
[2]: http://jquery.com/
[3]: http://documentcloud.github.com/underscore/
