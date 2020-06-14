import {exec} from 'child_process';
import {promisify} from 'util';
import {fileURLToPath} from 'url';

import show from 'sanctuary-show';


//    format :: EvaluationResult a -> String
const format = r =>
  r.throws ? `! ${r.exception}`
           : (r.result instanceof Error ? String : show) (r.result);

//    revert :: New -> Old
const revert = ({description, doctest: {correct, input, output}}) => [
  description,
  [
    correct,
    format (
      input.throws && output.throws && output.exception.message === '' ?
      {throws: true, exception: new input.exception.constructor ()} :
      input
    ),
    format (output),
    output.lines[0].number,
  ],
];

//    renames :: StrMap String
const renames = {
  'test/harmony': 'test/es2015',
};

//    additions :: StrMap Integer
const additions = {
  'test/exceptions': 1,
};

//    value :: a -> String -> StrMap a -> a
const value = x => k => m =>
  Object.prototype.hasOwnProperty.call (m, k) ? m[k] : x;

//    expected :: String -> Promise Error String
const expected = path =>
  promisify (exec)
            ('git show "$(git log --format=format:%H' +
             ` --grep 'add verification script')~2:${path}/results.json"`)
  .then (({stdout}) => JSON.parse (stdout))
  .then (tests =>
    import ('../' + value (path) (path) (renames) + '/results.js')
    .then (_ => tests.concat (_.default
                              .slice (-(value (-Infinity) (path) (additions)))
                              .map (revert)))
  );

//    actual :: String -> Promise Error String
const actual = path =>
  import ('../' + path + '/results.js')
  .then (_ => _.default.map (revert));


if (process.argv[1] === fileURLToPath (import.meta.url)) {
  Promise.all (
    process.argv
    .slice (2)
    .map (path => Promise.all ([Promise.resolve (path),
                                actual (path),
                                expected (path)]))
  )
  .then (triples => {
    process.exit (
      triples.reduce ((code, [path, actual, expected]) => {
        if (JSON.stringify (actual, null, 2) ===
            JSON.stringify (expected, null, 2)) {
          console.error (`\u001B[0;32m${path}\u001B[0m`);
          return code;
        } else {
          console.error (`\u001B[0;31m${path}\u001B[0m`);
          return 1;
        }
      }, 0)
    );
  });
}
