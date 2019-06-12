//    Channel :: String -> Any -> Output
const Channel = channel => value => ({channel, value});

//    Result :: Any -> Output
const Result = Channel (null);


export {Channel, Result};
