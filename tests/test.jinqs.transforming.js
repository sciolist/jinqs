var assert = require('assert');
var jinqs = require('./../src/jinqs');

exports.run = function(test) {
  // select(selector)
  test.that("select: should remap elements.", function() {
    var arr      = [49,49,49];
    var expected = [ 7, 7, 7];
  
    var j = jinqs.over(arr).select(Math.sqrt).toArray();
    assert.deepEqual(j, expected);
  });

  test.that("select: should work over empty enumerators.", function() {
    var j = jinqs.over([]).select(Math.sqrt).toArray();
    assert.deepEqual(j, []);
  });
  
  // selectMany(selector)
  test.that("selectMany: should flatten sequenced arrays", function() {
    var a = [[0, 1], [2, 3]];
    
    var b = jinqs.over(a).selectMany().toArray();
    assert.deepEqual(b, [0, 1, 2, 3]);
  });
}