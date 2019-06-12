export default ({Test, Line, Correct, Success, Result}) => [

  Test ('object spread syntax')
       ([Line (1) ('> {x: 0, ...{x: 1, y: 2, z: 3}, z: 4}')])
       ([Line (2) ('{x: 1, y: 2, z: 4}')])
       (Correct ([Success (Result ({x: 1, y: 2, z: 4}))])),

];
