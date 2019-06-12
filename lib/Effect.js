import {Result} from './Output.js';


//    Failure :: Any -> Effect
const Failure = exception => ({
  tag: 'Failure',
  exception,
});

//    Success :: Output -> Effect
const Success = output => ({
  tag: 'Success',
  output,
});

//    effect :: (Any -> a) -> (Output -> a) -> Effect -> a
const effect = failure => success => effect => {
  switch (effect.tag) {
    case 'Failure': return failure (effect.exception);
    case 'Success': return success (effect.output);
  }
};

//    encase :: AnyFunction -> ...Any -> Effect
const encase = f => (...args) => {
  try {
    return Success (Result (f (...args)));
  } catch (exception) {
    return Failure (exception);
  }
};


export {Failure, Success, effect, encase};
