depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Filtering");

// distinct(uniqueKeySelector)
test("distinct: should return all elements in a fully unique array.", function() {
  var arr = [4,3,2,1];
  var j = $jinqs(arr);
  sameEnum(j.distinct(), arr);
});

test("distinct: should remove elements that have already been returned.", function() {
  var arr = [4,4,3,4,2,3,1,1,2];
  var expected = [4,3,2,1];

  var j = $jinqs(arr);
  sameEnum(j.distinct(), expected);
});

test("distinct: single repeated element should be returned once.", function() {
  var arr = [1,1,1,1,1];
  var expected = [1];

  var j = $jinqs(arr);
  sameEnum(j.distinct(), expected);
});


// where(predicate)
test("where: filtered items should remain after reset.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);

  var set = j.where(function(i) { return i > 1; });
  same(set.toArray(), [9, 2]);

  set.reset();
  same(set.toArray(), [9, 2]);
});

test("where: repeat wheres should filter subset.", function()
{
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);

  var set = j.where(function(i) { return i > 1; })
          .where(function(i) { return i < 5; });
  same(set.toArray(), [2]);

  set.reset();
  same(set.toArray(), [2]);
});

// skip(count)
test("skip: should repeatedly skip.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);
  var result = j.skip(2);

  equals(result.first(), 1);
  equals(result.first(), 1);
});

test("skip: identical skips should get identical data.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);
  var skip1 = j.skip(2);
  var skip2 = j.skip(2);

  same(skip1.toArray(), skip2.toArray());
});

// skipWhile(predicate)
// take(count)
test("take: should repeatedly cut.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);
  var taken = j.take(2);
  sameEnum(taken, [0,9]);
});

test("take&skip: should work in a paging scenario.", function() {
  var arr = [1,2,3,4,5,6];
  var j = $jinqs(arr);

  sameEnum(j.skip(0).take(2), [arr[0], arr[1]]);
  sameEnum(j.skip(4).take(2), [arr[4], arr[5]]);
  sameEnum(j.skip(2).take(2), [arr[2], arr[3]]);
})

test("take: should stop at end of data.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);
  var taken = j.take(2000);

  sameEnum(taken, [0,9,1,0,2]);
})

test("take: identical takes should get identical data.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);
  var take1 = j.take(2);
  var take2 = j.take(2);

  sameEnum(take1, take2);
  sameEnum(take1, take2);
});

// takeWhile(predicate)
test("takeWhile: should stop at end of data.", function() {
  var arr = [0,9,1,0,2];
  var j = $jinqs(arr);
  sameEnum(j.takeWhile(function(){return true;}), arr);
});

// reset()
