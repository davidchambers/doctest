export default ({Test, Line, Correct, Success, Result}) => [

  Test ('accepts Transcribe-style prefix')
       ([Line (11) ('> map(Math.sqrt)([1, 4, 9])')])
       ([Line (12) ('[1, 2, 3]')])
       (Correct ([Success (Result ([1, 2, 3]))])),

];
