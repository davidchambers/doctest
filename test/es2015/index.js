function* fibonacci() {
  var prev = 0;
  var curr = 1;
  while (true) {
    yield curr;
    var next = prev + curr;
    prev = curr;
    curr = next;
  }
}

// > seq.next().value
// 1
// > seq.next().value
// 1
// > seq.next().value
// 2
// > seq.next().value
// 3
// > seq.next().value
// 5
var seq = fibonacci();
