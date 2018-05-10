// > Absolute(-1)
// Absolute(1)
function Absolute(n) {
  if (!(this instanceof Absolute)) return new Absolute(n);
  this.value = n;
}

Absolute['@@type'] = 'doctest/Absolute';

Absolute.prototype['@@show'] = function() {
  return 'Absolute (' + this.value + ')';
};

Absolute.prototype['fantasy-land/equals'] = function(other) {
  return Math.abs(this.value) === Math.abs(other.value);
};
