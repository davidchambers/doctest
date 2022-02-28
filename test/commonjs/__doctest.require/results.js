export default ({Test, Line, Correct, Success}) => [

  Test ('__doctest.require')
       ([Line (5) ("> (new url.URL ('https://sanctuary.js.org/')).hostname")])
       ([Line (6) ("'sanctuary.js.org'")])
       (Correct (Success ('sanctuary.js.org'))),

];
