#% map :: (a -> b) -> Array a -> Array b
#.
#. Transforms a list of elements of type `a` into a list of elements
#. of type `b` using the provided function of type `a -> b`.
#.
#. > This is a Markdown `<blockquote>` element. If the `--opening-delimiter`
#. > and `--closing-delimiter` options are set to <code>```coffee</code> and
#. > <code>```</code> respectively, these lines will not be evaluated.
#.
#. ```coffee
#. > map(Math.sqrt)([1, 4, 9])
#. [1, 2, 3]
#. ```
map = (f) -> (xs) -> f x for x in xs
