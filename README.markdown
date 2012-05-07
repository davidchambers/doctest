# doctest

A quick and (very) dirty implementation of JavaScript [doctests][1], for
those rare occasions when tests of this nature are actually appropriate.

    Math.product = function () {
      // > Math.product(3, 4, 5)
      // 60
      // > Math.product(2, "ten")
      // NaN
      // > Math.product(6)
      // undefined
      var idx = arguments.length
      if (idx) {
        var product = arguments[0]
        while (--idx) product *= arguments[idx]
        return product
      }
    }

To run doctests, pass `doctest` a path to the "module" to be tested. The
path should be one of the following:

  - an absolute URL; e.g. "http://example.com/scripts/math-extensions.js"
  - a root-relative URL; e.g. "/scripts/math-extensions.js"
  - a path relative to doctest.js; e.g. "./math-extensions.js"

This can easily be done from a browser console:

    :::text
    > doctest("./math-extensions.js")
    retrieving /scripts/./math-extensions.js...
    running doctests in /scripts/./math-extensions.js...
    ..x
    expected undefined on line 7 (got 6)

Oops. Looks like we have a bug.

### Scoping

All expressions are eval'd in the global scope, so the following will leave
a `user` property attached to the global object:

    > user = {first_name: "Sheldon", last_name: "Cooper"}
    > user.first_name + " " + user.last_name
    "Sheldon Cooper"

This shouldn't be a problem in practice (and it's actually rather useful in
some cases), but it's worth bearing in mind that variables are available to
all subsequent tests.

### Dependencies

  - [jQuery][2]
  - [Underscore][3]


[1]: http://docs.python.org/library/doctest.html
[2]: http://jquery.com/
[3]: http://documentcloud.github.com/underscore/
