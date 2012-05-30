0.
// > global
// "global"
global = 'global'

!function() {

  1.
  // > global
  // "global"
  !function() {
    2.
    // > global
    // "shadowed"
    var global = 'shadowed'
  }()

  3.
  // > one * two
  // 2
  var one = 1
  var two = 2
  4.
  // > three = one + two
  // 3
  5.
  // > [one, two, three]
  // [1, 2, 3]
  6.
  // > two + two
  // 5

  7.
  // > null.length
  // TypeError
  8.
  // > [].length
  // TypeError

  9.
  // > double(6)
  // 12
  10.
  // > double()
  // NaN
  var double = function(n) {
    // doctests should only be included in contexts where they'll be
    // invoked immediately (i.e. at the top level or within an IIFE)
    return 2 * n
  }
  11.
  // > double.call(null, 2)
  // 4

  var triple = function(n) {
    // > this.doctest.should.never.be.executed
    // ( blow.up.if.for.some.reason.it.is )
    return 3 * n
  }

  12.
  // > [1,2,3,
  // .  4,5,6,
  // .  7,8,9]
  // [1,2,3,4,5,6,7,8,9]
  13.
  // > text = "input " +
  // . "may span many " +
  // . "lines"
  // > text
  // "input may span many lines"

  14.
  //>"no spaces"
  //"no spaces"
  15.
  //     > "Docco-compatible whitespace"
  //     "Docco-compatible whitespace"
  16.
  // > 2 > 1
  // true

  17.
  // > "foo" + "bar" // comment
  // "foobar"
  18.
  // > 5 * 5
  // 25 // comment

  19.
  // > "the rewriter should not rely"
  // "on automatic semicolon insertion"
  (4 + 4)

}()
