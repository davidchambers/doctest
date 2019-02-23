//# map :: (a -> b) -> Array a -> Array b
//.
//. Transforms a list of elements of type `a` into a list of elements
//. of type `b` using the provided function of type `a -> b`.
//.
//. > This is a Markdown `<blockquote>` element. If the `--opening-delimiter`
//. > and `--closing-delimiter` options are set to <code>```javascript</code>
//. > and <code>```</code> respectively, these lines will not be evaluated.
//.
//. ```javascript
//. > map(Math.sqrt)([1, 4, 9])
//. [1, 2, 3]
//. ```
var map = function(f) {
  return function(xs) {
    var output = [];
    for (var idx = 0; idx < xs.length; idx += 1) {
      output.push(f(xs[idx]));
    }
    return output;
  };
};
