// Convert degrees Celsius to degrees Fahrenheit.
//
// > import util from 'util'
// > util.inspect (toFahrenheit (0))
// '32'
export function toFahrenheit(degreesCelsius) {
  return degreesCelsius * 9 / 5 + 32;
}
