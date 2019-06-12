export default ({Test, Line, Correct, Success, Result}) => [

  Test ('nullish coalescing operator')
       ([Line (1) ("> null ?? 'default'")])
       ([Line (2) ("'default'")])
       (Correct ([Success (Result ('default'))])),

];
