import Absolute from './index.js';


export default ({Test, Line, Correct, Success, Result}) => [

  Test ('uses Z.equals for equality checks')
       ([Line (1) ('> Absolute(-1)')])
       ([Line (2) ('Absolute(1)')])
       (Correct ([Success (Result (Absolute (-1)))])),

];
