var assert = require('assert');
var jinqs = require('./../src/jinqs');

exports.run = function(test) {
  // each(predicate)
  // elementAt(index, defaultValue)
  test.that("elementAt: should fetch all elements in a set.", function() {
    var arr = [9,0,2,1,0];
    var j = jinqs.over(arr).where(function(){return true;}); // avoid array optimiszation

    for(var i=0; i<arr.length; ++i) {
  	  var em = arr[i];
  	  assert.equal(j.elementAt(i), em);
    }
    assert.ok(arr.length);
  });

  test.that("elementAt: out of bounds index should return defaultValue.", function() {
    var arr = [9,0,2,1,0];
    var j = jinqs.over(arr).where(function(){return true;}); // avoid array optimiszation
    assert.equal(j.elementAt( -1, "oob"), "oob");
    assert.equal(j.elementAt(100, "oob"), "oob");
  });

  test.that("elementAt: default defaultValue should be 'undefined'.", function() {
    var arr = [9,0,2,1,0];
    var j = jinqs.over(arr).where(function(){return true;}); // avoid array optimiszation
    assert.ok(j.elementAt( -1) === undefined);
    assert.ok(j.elementAt(100) === undefined);
  });
  // first(predicate, defaultValue)
  // last(predicate, defaultValue)
  // getEnumerator()
  // toArray()
  // toObject(keySelector, valueSelector, requireUniqueKeys)
  // toLookup(keySelector, valueSelector)
};