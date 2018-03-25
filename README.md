# doctest

[Doctests][1] are executable usage examples sometimes found in "docstrings".
JavaScript doesn't have docstrings, but inline documentation can be included
in code comments. doctest finds and evaluates usage examples in code comments
and reports any inaccuracies. doctest works with JavaScript and CoffeeScript
modules.

### Example

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

Doctest will execute `toFahrenheit(0)` and verify that its output is `32`.

### Installation

```console
$ npm install doctest
```

### Running doctests

Test a module via JavaScript API:

```javascript
> doctest('lib/temperature.js', {})
```

Test a module via command-line interface:

```console
$ doctest lib/temperature.js
```

The exit code is 0 if all tests pass, 1 otherwise.

### AMD and CommonJS modules

doctest supports CommonJS modules and partially supports AMD modules:

| Module system               | Node.js |
| --------------------------- |:-------:|
| AMD                         |    ✔︎    |
| AMD w/ dependencies         |    ✘    |
| CommonJS                    |    ✔︎    |
| CommonJS w/ dependencies    |    ✔︎    |

Specify module system via JavaScript API:

```javascript
> doctest('path/to/amd/module.js', {module: 'amd'})
```

Specify module system via command-line interface:

```console
$ doctest --module commonjs path/to/commonjs/module.js
```

### Line wrapping

Input lines may be wrapped by beginning each continuation with FULL STOP (`.`):

```javascript
// > reverse([
// .   'foo',
// .   'bar',
// .   'baz',
// . ])
// ['baz', 'bar', 'foo']
```

Output lines may be wrapped in the same way:

```javascript
// > reverse([
// .   'foo',
// .   'bar',
// .   'baz',
// . ])
// [ 'baz',
// . 'bar',
// . 'foo' ]
```

### Exceptions

An output line beginning with EXCLAMATION MARK (`!`) indicates that the
preceding expression is expected to throw. The exclamation mark *must* be
followed by SPACE (<code> </code>) and the name of an Error constructor.
For example:

```javascript
// > null.length
// ! TypeError
```

The constructor name *may* be followed by COLON (`:`), SPACE (<code> </code>),
and the expected error message. For example:

```javascript
// > null.length
// ! TypeError: Cannot read property 'length' of null
```

### Scoping

Each doctest has access to variables in its scope chain.

### Integrations

  - [Grunt](http://gruntjs.com/):
      [paolodm/grunt-doctest](https://github.com/paolodm/grunt-doctest)

### Running the test suite

```console
$ npm install
$ npm test
```


[1]: http://docs.python.org/library/doctest.html
