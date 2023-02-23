export default ({Test, Line, Correct, Success}) => [

  Test ('require another CommonJS module')
       ([Line (1) ('> typeof $require("assert")')])
       ([Line (2) ('"function"')])
       (Correct (Success ('function'))),

];
