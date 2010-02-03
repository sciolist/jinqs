depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Testing");

// all(predicate)
test("all: should always succeed over empty sets.", function() {
  var all = $jinqs([]).all(function(i) { return i > 1000000; });
  ok(all, "");
});

test("all: should only fetch elements until a nonmatching value is found.", function() {
  var arr = [1,2,3,4,5,6,0];
  var j = $jinqs(arr).select(function(i)
  {
    if(i > 2) { ok(false, "Went to " + i + ", too far!"); throw false; }
    return i;
  });
  
  ok(!j.all(function(i){ return i <= 1; }), "");
});

// any(predicate)
test("any: no parameter should imply 'any elements at all'.", function() {
  ok( $jinqs([1]).any(), "");
  ok(!$jinqs([ ]).any(), "");
});

test("any: should only fetch elements until a match is found.", function() {
  var arr = [1,2,3,4,5,6,0];
  var j = $jinqs(arr).select(function(i)
  {
    if(i > 2) { ok(false, "Went to " + i + ", too far!"); throw false; }
    return i;
  });
  
  ok(j.any(function(i){ return i > 1; }), "");
});


// contains(value)
