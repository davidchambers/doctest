#% map :: (a -> b) -> [a] -> [b]
#.
#. Transforms a list of elements of type `a` into a list of elements
#. of type `b` using the provided function of type `a -> b`.
#.
#. ```coffee
#. > map(Math.sqrt)([1, 4, 9])
#. [1, 2, 3]
#. ```
map = (f) -> (xs) -> f x for x in xs
