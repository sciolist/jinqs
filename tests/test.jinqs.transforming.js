depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Transforming");

// select(selector)
test("select: should remap elements.", function() {
  var arr      = [49,49,49];
  var expected = [ 7, 7, 7];
  
  var j = $jinqs(arr).select(Math.sqrt);
  sameEnum(j, expected);
});

test("select: should work over empty enumerators.", function() {
  var j = $jinqs([]).select(Math.sqrt);
  sameEnum(j, []);
});
// selectMany(selector)
