var assert = require('assert');
var jinqs = require('./../lib/jinqs');

exports.run = function(test) {
  // each(predicate)
  test.that("each: iterates each value.", function() {
    var a = [0, 1, 2];
    var total = 0;
    
    jinqs.over(a).each(function(v) { total += v; });
    assert.equal(total, 3);
  });
  
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
  
  // toArray()
  test.that("toArray: should generate an array with the values of the sequence", function() {
    var arr = [0, 1, 2, 3];
    var c = jinqs.over(arr).toArray();
    assert.deepEqual(c, arr);
    assert.notEqual(c, arr); // shouldn't point to the exact same array.
  });
  
  // toObject(keySelector, valueSelector, requireUniqueKeys)
  test.that("toObject: should create a hash map of values from the sequence", function() {
    var a = [["key", "value"], ["key2", "value2"]];
    var c = jinqs.over(a).toObject(function(a){return a[0]}, function(a){return a[1]});
    
    assert.equal(c["key"], "value");
    assert.equal(c["key2"], "value2");
  });
  
  // first(predicate, defaultValue)
  test.that("first: should fetch first matching value", function() {
    var a = [{v:0},{v:1},{v:2},{v:1},{v:2}];
    var b = jinqs.over(a).first(function(v){return v.v>1;})
    assert.equal(b, a[2]);
  });
  
  // last(predicate, defaultValue)
  test.that("last: should fetch last matching value", function() {
    var a = [{v:0},{v:1},{v:2},{v:1},{v:2}];
    var b = jinqs.over(a).last(function(v){return v.v>1;})
    assert.equal(b, a[4]);
  });
  
  // getEnumerator()
  test.that("getEnumerator: should create an enumerator over the source", function() {
    var a = [0, 1];
    var enumr = jinqs.over(a).getEnumerator();
    
    assert.ok(enumr.moveNext());
    assert.equal(enumr.current(), 0);
    assert.ok(enumr.moveNext());
    assert.equal(enumr.current(), 1);
    assert.ok(!enumr.moveNext());
    assert.equal(enumr.current(), null);
  });
  
  // toLookup(keySelector, valueSelector)
  test.that("toLookup: should create a hash of arrays", function() {
    var a = [0, 0, 1, 2, 2, 2];
    var b = jinqs.over(a).toLookup();
    assert.deepEqual(b[0], [0, 0]);
    assert.deepEqual(b[1], [1]);
    assert.deepEqual(b[2], [2, 2, 2]);
  });
};