var assert = require('assert');
var jinqs = require('./../lib/jinqs');

exports.run = function(test) {
  // orderBy(keySelector, comparer)
  test.that("orderBy: can sort values", function() {
    var a = [2, 3, 0, 1];
    var b = [0, 1, 2, 3];
    
    assert.deepEqual(jinqs.over(a).orderBy().toArray(), b);
  });
  
  // orderByDesc(keySelector, comparer)
  test.that("orderByDesc: can sort values", function() {
    var a = [2, 3, 0, 1];
    var b = [3, 2, 1, 0];
    
    assert.deepEqual(jinqs.over(a).orderByDesc().toArray(), b);
  });
  
  // thenBy(keySelector, comparer)
  test.that("thenBy: can add additional sorting", function() {
    var a = [[2],[1,1],[1,0],[0]];
    var b = [[0],[1,0],[1,1],[2]];
    
    var c = jinqs.over(a).orderBy(function(v) { return v[0]; })
                         .thenBy(function(v){ return v[1]||0; }).toArray();
    assert.deepEqual(c, b);
  });
  
  // thenByDesc(keySelector, comparer)
  test.that("thenByDesc: can add additional sorting", function() {
    var a = [[2],[1,0],[1,1],[0]];
    var b = [[0],[1,1],[1,0],[2]];
    
    var c = jinqs.over(a).orderBy(function(v){ return v[0]; })
                         .thenByDesc(function(v){ return v[1]||0; }).toArray();
    assert.deepEqual(c, b);
  });
  
  // reverse()
  test.that("reverse: creates an enumerator moving backwards over the sequence.", function() {
    var a = [0, 1, 2];
    var b = jinqs.over(a).reverse().toArray();
    assert.deepEqual(b, [2, 1, 0]);
  });
};