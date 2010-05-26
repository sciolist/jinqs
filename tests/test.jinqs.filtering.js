var assert = require('assert');
var jinqs = require('./../lib/jinqs');

exports.run = function(test) {
  // distinct(uniqueKeySelector)
  test.that("distinct: should return all elements in a fully unique array.", function() {
    var arr = [4,3,2,1];
    var j = jinqs.over(arr);
    assert.deepEqual(j.distinct().toArray(), arr);
  });

  test.that("distinct: should remove elements that have already been returned.", function() {
    var arr = [4,4,3,4,2,3,1,1,2];
    var expected = [4,3,2,1];

    var j = jinqs.over(arr);
    assert.deepEqual(j.distinct().toArray(), expected);
  });

  test.that("distinct: single repeated element should be returned once.", function() {
    var arr = [1,1,1,1,1];
    var expected = [1];

    var j = jinqs.over(arr);
    assert.deepEqual(j.distinct().toArray(), expected);
  });


  // where(predicate)
  test.that("where: repeat wheres should filter subset.", function()
  {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);

    var set = j.where(function(i) { return i > 1; })
               .where(function(i) { return i < 5; });
    assert.deepEqual(set.toArray(), [2]);
  });

  // skip(count)
  test.that("skip: should repeatedly skip.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    var result = j.skip(2);

    assert.equal(result.first(), 1);
    assert.equal(result.first(), 1);
  });

  test.that("skip: identical skips should get identical data.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    var skip1 = j.skip(2);
    var skip2 = j.skip(2);

    assert.deepEqual(skip1.toArray(), skip2.toArray());
  });

  // skipWhile(predicate)
  test.that("skipWhile: should stop at end of data.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    assert.deepEqual(j.skipWhile(function(){return true;}).toArray(), []);
  });
  test.that("skipWhile: should start after finding a match.", function() {
    var arr = [0,9,1,0,2];
    
    var j = jinqs.over(arr).skipWhile(function(v){return v<=0}).toArray();
    assert.deepEqual(j, [9,1,0,2]);
  });
  
  // take(count)
  test.that("take: should repeatedly cut.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    var taken = j.take(2);
    assert.deepEqual(taken.toArray(), [0,9]);
    assert.deepEqual(taken.toArray(), [0,9]);
  });

  test.that("take&skip: should work in a paging scenario.", function() {
    var arr = [1,2,3,4,5,6];
    var j = jinqs.over(arr);

    assert.deepEqual(j.skip(0).take(2).toArray(), [arr[0], arr[1]]);
    assert.deepEqual(j.skip(4).take(2).toArray(), [arr[4], arr[5]]);
    assert.deepEqual(j.skip(2).take(2).toArray(), [arr[2], arr[3]]);
  })

  test.that("take: should stop at end of data.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    var taken = j.take(2000).toArray();

    assert.deepEqual(taken, [0,9,1,0,2]);
  })

  test.that("take: identical takes should get identical data.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    var take1 = j.take(2).toArray();
    var take2 = j.take(2).toArray();

    assert.deepEqual(take1, take2);
    assert.deepEqual(take1, take2);
  });

  // takeWhile(predicate)
  test.that("takeWhile: should stop at end of data.", function() {
    var arr = [0,9,1,0,2];
    var j = jinqs.over(arr);
    assert.deepEqual(j.takeWhile(function(){return true;}).toArray(), arr);
  });
};