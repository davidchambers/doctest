# doctest

[Doctests][1] are executable usage examples sometimes found in "docstrings".
JavaScript doesn't have docstrings, but inline documentation can be included
in code comments. doctest tests the accuracy of usage examples in JavaScript
and CoffeeScript modules.

```javascript
// toFahrenheit :: Number -> Number
//
// Convert degrees Celsius to degrees Fahrenheit.
//
// > toFahrenheit(0)
// 32
// > toFahrenheit(100)
// 212
function toFahrenheit(degreesCelsius) {
  return degreesCelsius * 9 / 5 + 32;
}
```

### Running doctests

Test a module via JavaScript API:

    > doctest("lib/temperature.js")

Test a module via command-line interface:

    $ doctest lib/temperature.js

The exit code indicates the number of test failures:

    $ echo $?
    0

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

Each doctest has access to variables in its scope chain.

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
