var assert = require('assert');
var ns = require('./../src/enumerator');

exports.run = function(test) {
  test.that("enumerator should iterate method results.", function() {
    var i = 0;
    var method = function() { if(i<10) return ++i; }
  
    var enumerator = ns.jinqs.Enumerator.func(method);
  
    assert.ok(enumerator.moveNext());
    assert.equal(enumerator.current(), 1);
    assert.ok(enumerator.moveNext());
    assert.equal(enumerator.current(), 2);
  });
};