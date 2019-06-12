export default ({Test, Line, Correct, Success, Result}) => [

  Test ('__doctest.require')
       ([Line (5) ("> (new url.URL ('https://sanctuary.js.org/')).hostname")])
       ([Line (6) ("'sanctuary.js.org'")])
       (Correct ([Success (Result ('sanctuary.js.org'))])),

];
