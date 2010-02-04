depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Function enumeration");

test("should iterate method results.", function() {
  var i = 0;
  var method = function() { if(i<10) return ++i; }
  
  var enumerator = Ken.Enumerator.func(method);
  
  ok(enumerator.moveNext());
  equal(enumerator.current(), 1);
  ok(enumerator.moveNext());
  equal(enumerator.current(), 2);
});
