depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Retrieval");

// each(predicate)
// elementAt(index, defaultValue)
test("elementAt: should fetch all elements in a set.", function() {
  var arr = [9,0,2,1,0];
  var j = $jinqs(arr).where(function(){return true;}); // avoid array optimiszation

  for(var i=0; i<arr.length; ++i) {
	var em = arr[i];
	equals(j.elementAt(i), em);
  }
});

test("elementAt: out of bounds index should return defaultValue.", function() {
  var arr = [9,0,2,1,0];
  var j = $jinqs(arr).where(function(){return true;}); // avoid array optimiszation
  equals(j.elementAt( -1, "oob"), "oob");
  equals(j.elementAt(100, "oob"), "oob");
});

test("elementAt: default defaultValue should be 'undefined'.", function() {
  var arr = [9,0,2,1,0];
  var j = $jinqs(arr).where(function(){return true;}); // avoid array optimiszation
  ok(j.elementAt( -1) === undefined, "undefined returned!");
  ok(j.elementAt(100) === undefined, "undefined returned!");
});
// first(predicate, defaultValue)
// last(predicate, defaultValue)
// getEnumerator()
// toArray()
// toObject(keySelector, valueSelector, requireUniqueKeys)
// toLookup(keySelector, valueSelector)
