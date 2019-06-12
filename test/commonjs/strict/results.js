export default ({Test, Line, Correct, Success, Result}) => [

  Test ("preserves 'use strict' directive")
       ([Line (3) ('> (function() { return this; }())')])
       ([Line (4) ('undefined')])
       (Correct ([Success (Result (undefined))])),

];
