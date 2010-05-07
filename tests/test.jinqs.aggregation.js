var assert = require('assert');
var jinqs = require('./../src/jinqs');

exports.run = function(test) {
  // aggregate(seed, accumulator, resultSelector)
  test.that("aggregate: should infer seed value.", function() {
    var j = jinqs.over([1,1]).aggregate(function(c,n){return c+n;});
    assert.equal(j, 2);
  });

  test.that("aggregate: should use supplied seed value.", function() {
    var j = jinqs.over([1,1]).aggregate(-2, function(c,n){return c+n;});
    assert.equal(j, 0);
  });

  // average(selector)
  // count(predicate)
  // min(selector)
  test.that("min: should fetch lowest available value.", function() {
    var j = jinqs.over([2,3,4,3,2])
    assert.equal(j.min(), 2);
  });

  // max(selector)
  test.that("max: should fetch highest available value.", function() {
    var j = jinqs.over([-3,-2,-1,-2,-3])
    assert.equal(j.max(), -1);
  });

  // sum(selector)
  test.that("sum: should combine all values in j.", function() {
    var j = jinqs.over([1,2,3,2,1])
    assert.equal(j.sum(), 9);
  });
};