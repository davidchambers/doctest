1.
// > global
// "global"
global = 'global'

!function() {

  2.
  // > global
  // "global"
  !function() {
    3.
    // > global
    // "shadowed"
    var global = 'shadowed'
  }()

  4.
  // > one * two
  // 2
  var one = 1
  var two = 2
  5.
  // > three = one + two
  // 3
  6.
  // > [one, two, three]
  // [1, 2, 3]
  7.
  // > two + two
  // 5

  8.
  // > null.length
  // TypeError
  9.
  // > [].length
  // TypeError

  10.
  // > double(6)
  // 12
  11.
  // > double()
  // NaN
  var double = function(n) {
    // doctests should only be included in contexts where they'll be
    // invoked immediately (i.e. at the top level or within an IIFE)
    return 2 * n
  }
  12.
  // > double.call(null, 2)
  // 4

  var triple = function(n) {
    // > this.doctest.should.never.be.executed
    // ( blow.up.if.for.some.reason.it.is )
    return 3 * n
  }

  13.
  // > [1,2,3,
  // .  4,5,6,
  // .  7,8,9]
  // [1,2,3,4,5,6,7,8,9]
  14.
  // > text = "input " +
  // . "may span many " +
  // . "lines"
  // > text
  // "input may span many lines"

  15.
  //>"no spaces"
  //"no spaces"
  16.
  //     > "Docco-compatible whitespace"
  //     "Docco-compatible whitespace"
  17.
  // > 2 > 1
  // true

  18.
  // > "foo" + "bar" // comment
  // "foobar"
  19.
  // > 5 * 5
  // 25 // comment

  20.
  // > "the rewriter should not rely"
  // "on automatic semicolon insertion"
  (4 + 4)

}()
