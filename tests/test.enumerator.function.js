var assert = require('assert');
var jinqs = require('./../src/jinqs');

exports.run = function(test) {
  test.that("enumerator should iterate method results.", function() {
    var i = 0;
    var method = function() { if(i<10) return ++i; }
  
    var enumerator = Ken.Enumerator.func(method);
  
    assert.ok(enumerator.moveNext());
    assert.equal(enumerator.current(), 1);
    assert.ok(enumerator.moveNext());
    assert.equal(enumerator.current(), 2);
  });
};