# inc :: Number -> Number
#
# > inc (0)
inc = (x) -> x + 1

# dec :: Number -> Number
#
# > dec (0)
#
# This is not an output line as it does not immediately follow an input line.
dec = (x) -> x - 1

# zero :: Integer -> Integer
#
# > zero (42)
# 0
zero = (x) ->
  switch true
    when x < 0
      zero inc x
    when x > 0
      zero dec x
    else
      0
