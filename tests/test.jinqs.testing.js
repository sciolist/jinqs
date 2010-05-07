var assert = require('assert');
var jinqs = require('./../src/jinqs');

exports.run = function(test) {
  // all(predicate)
  test.that("all: should always succeed over empty sets.", function() {
    var all = jinqs.over([]).all(function(i) { return i > 1000000; });
    assert.ok(all);
  });

  test.that("all: should only fetch elements until a nonmatching value is found.", function() {
    var arr = [1,2,3,4,5,6,0];
    var j = jinqs.over(arr).select(function(i)
    {
      if(i > 2) { throw new Error("Went to index '" + i + "', which is too far."); }
      return i;
    });
    
    assert.ok(!j.all(function(i){ return i <= 1; }));
  });

  // any(predicate)
  // contains(value)
  test.that("any: no parameter should imply 'any elements at all'.", function() {
    assert.ok( jinqs.over([1]).any());
    assert.ok(!jinqs.over([ ]).any());
  });

  test.that("any: should only fetch elements until a match is found.", function() {
    var arr = [1,2,3,4,5,6,0];
    var j = jinqs.over(arr).select(function(i)
    {
      if(i > 2) { ok(false, "Went to " + i + ", too far!"); throw false; }
      return i;
    });
  
    assert.ok(j.any(function(i){ return i > 1; }));
  });


  // contains(value)
};