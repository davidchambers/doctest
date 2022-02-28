//    Failure :: Any -> Effect
const Failure = exception => ({
  tag: 'Failure',
  exception,
});

//    Success :: Any -> Effect
const Success = value => ({
  tag: 'Success',
  value,
});

//    effect :: (Any -> a) -> (Any -> a) -> Effect -> a
const effect = failure => success => effect => {
  switch (effect.tag) {
    case 'Failure': return failure (effect.exception);
    case 'Success': return success (effect.value);
  }
};

//    encase :: AnyFunction -> ...Any -> Effect
const encase = f => (...args) => {
  try {
    return Success (f (...args));
  } catch (exception) {
    return Failure (exception);
  }
};


export {Failure, Success, effect, encase};
