//  inc :: Number -> Number
//
//  > inc (0)
const inc = x => x + 1;

//  dec :: Number -> Number
//
//  > dec (0)
//
//  This is not an output line as it does not immediately follow an input line.
const dec = x => x - 1;

//  zero :: Integer -> Integer
//
//  > zero (42)
//  0
function zero(x) {
  return x < 0 ? zero (inc (x)) :
         x > 0 ? zero (dec (x)) :
                 0;
}

zero (0);
