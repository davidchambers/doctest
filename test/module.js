define(function() {
  // Convert degrees Celsius to degrees Fahrenheit.
  //
  // > toFahrenheit(0)
  // 32
  // > toFahrenheit(100)
  // 212
  function toFahrenheit(degreesCelsius) {
    return degreesCelsius * 9 / 5 + 32;
  }
  return toFahrenheit;
});
