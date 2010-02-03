depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Aggregation");

// aggregate(seed, accumulator, resultSelector)
test("aggregate: should infer seed value.", function() {
  var j = $jinqs([1,1]).aggregate(function(c,n){return c+n;});
  equals(j, 2);
});

test("aggregate: should use supplied seed value.", function() {
  var j = $jinqs([1,1]).aggregate(-2, function(c,n){return c+n;});
  equals(j, 0);
});

// average(selector)
// count(predicate)
// min(selector)
test("min: should fetch lowest available value.", function() {
  var j = $jinqs([2,3,4,3,2])
  equals(j.min(), 2);
});

// max(selector)
test("max: should fetch highest available value.", function() {
  var j = $jinqs([-3,-2,-1,-2,-3])
  equals(j.max(), -1);
});

// sum(selector)
test("sum: should combine all values in j.", function() {
  var j = $jinqs([1,2,3,2,1])
  equals(j.sum(), 9);
});
