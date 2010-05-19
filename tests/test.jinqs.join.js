var assert = require('assert');
var jinqs = require('./../src/jinqs');

exports.run = function(test) {
  // concat(sequence)
  // intersect(inner, keySelector)
  test.that("intersect: should return nothing if any side is empty.", function() {
    var a = jinqs.over([1,2,3]);
    var b = jinqs.over([]);

    assert.deepEqual(a.intersect(b).toArray(), []);
    assert.deepEqual(b.intersect(a).toArray(), []);
  });

  test.that("intersect: should return all identical values.", function() {
    var a = jinqs.over([1,2,3,4,5]);
    var b = [2,4];

    assert.deepEqual(a.intersect(b).toArray(), [2,4]);
  });


  // join(inner, outerKeySelector, innerKeySelector, resultSelector, outerJoin)
  test.that("join: should combine records.", function() {
    var first =  [ { id: 1, name: "jdp" }, { id: 2, name: "kitty" } ];
    var second = [ { id: 1, uid: 2, key: "fluffy" }, { id: 2, uid: 1, key: "non-fluffy" } ];
    var expected = function(id) { return id == 1 ? "non-fluffy" : "fluffy"; }

    var j = jinqs.over(first);
    var set = j.join(second,
                    function(f) { return f.id;  },
                    function(f) { return f.uid; }
                  ).toArray();

    assert.equal(set.length, 2);
    assert.equal(set[0][1].key, expected(set[0][0].id));
    assert.equal(set[1][1].key, expected(set[1][0].id));
    assert.ok(set[0][0].id != set[0][1].id, "no duplicates");
  });

  test.that("join: should create multiple rows for each match.", function() {
    var first =  [ { id: 1, name: "jdp" } ];
    var second = [ { id: 1, uid: 1, key: "non-fluffy" }, { id: 2, uid: 1, key: "male" } ];

    var j = jinqs.over(first);
    var set = j.join(second,
                    function(f) { return f.id;  },
                    function(f) { return f.uid; }
                  );

  
    assert.equal(set.count(), 2);
    assert.ok(set.any(function(d){ return d[1].key == "male"; }));
    assert.ok(set.any(function(d){ return d[1].key == "non-fluffy"; }));
    assert.ok(set.all(function(d){ return d[0].name == "jdp"; }))
  });


  // groupBy(keySelector, resultSelector)
  test.that("groupBy: should be able to collect joined values.", function() {
    var first =  [ { id: 1, name: "jdp" } ];
    var second = [ { id: 1, uid: 1, key: "non-fluffy" }, { id: 2, uid: 1, key: "male" } ];

    var j = jinqs.over(first);
    var set = j.join(second,function(f) { return f.id;  },function(f) { return f.uid; })
                  .groupBy(
                    function(data) { return data[0].id; }
                    ).toArray();

    assert.equal(set.length, 1);
    assert.equal(set[0].length, 2);
    assert.ok(jinqs.over(set[0][1]).any(function(d){ return d[1].key == "male"; }));
    assert.ok(jinqs.over(set[0][1]).any(function(d){ return d[1].key == "non-fluffy"; }));
  });


  // groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector)
  test.that("groupJoin: should perform grouping on a join source automatically.", function() {
    var first =  [ { id: 1, name: "jdp" } ];
    var second = [ { id: 1, uid: 1, key: "non-fluffy" }, { id: 2, uid: 1, key: "male" } ];

    var j = jinqs.over(first);
    var set = j.groupJoin(second,
             function(f) { return f.id;  },
             function(f) { return f.uid; })
                  .toArray();

    assert.equal(set.length, 1);
    assert.equal(set[0].length, 2);
    assert.ok(jinqs.over(set[0][1]).any(function(d){ return d.key == "male"; }));
    assert.ok(jinqs.over(set[0][1]).any(function(d){ return d.key == "non-fluffy"; }));
  });

  test.that("groupJoin: should get elements that have no matching values.", function() {
    var first =  [ { id: 1, name: "jdp" } ];
    var second = [ { id: 1, uid: 2, key: "non-fluffy" }, { id: 2, uid: 2, key: "male" } ];

    var j = jinqs.over(first);
    var set = j.groupJoin(second,
             function(f) { return f.id;  },
             function(f) { return f.uid; })
                  .toArray();

    assert.equal(set.length, 1);
    assert.equal(set[0][1].length, 0);
  });

  // zip(sequence, predicate)
  test.that("zip: should iterate arrays", function() {
    var a = [0, 1, 2];
    var b = [9, 8, 7];
    
    var c = jinqs.over(a).zip(b).toArray();
    assert.deepEqual(c, [[0, 9], [1, 8], [2, 7]]);
  });
  
  test.that("zip: should iterate all elements from the first sequence", function() {
    var a = [0, 1, 2];
    var b = [];

    var c = jinqs.over(a).zip(b).toArray();
    assert.equal(c[0][0], 0); assert.equal(c[0][1], null);
    assert.equal(c[1][0], 1); assert.equal(c[1][1], null);
    assert.equal(c[2][0], 2); assert.equal(c[2][1], null);
  });
  
  test.that("zip: should stop iterating at end of first sequence", function() {
    var a = [0, 1];
    var b = [9, 8, 7];

    var c = jinqs.over(a).zip(b).toArray();
    assert.deepEqual(c, [[0, 9], [1, 8]]);
  });
  
  // union(inner, keySelector)
};