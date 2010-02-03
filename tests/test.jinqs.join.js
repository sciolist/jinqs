depend("src/enumerator.js");
depend("src/quicksort.js");
depend("src/jinqs.js");
module("Join");

// concat(sequence)
// intersect(inner, keySelector)
test("intersect: should return nothing if any side is empty.", function() {
  var a = $jinqs([1,2,3]);
  var b = $jinqs([]);

  sameEnum(a.intersect(b), []);
  sameEnum(b.intersect(a), []);
});

test("intersect: should return all identical values.", function() {
  var a = $jinqs([1,2,3,4,5]);
  var b = [2,4];

  sameEnum(a.intersect(b), [2,4]);
});


// join(inner, outerKeySelector, innerKeySelector, resultSelector, outerJoin)
test("join: should combine records.", function() {
  var first =  [ { id: 1, name: "jdp" }, { id: 2, name: "kitty" } ];
  var second = [ { id: 1, uid: 2, key: "fluffy" }, { id: 2, uid: 1, key: "non-fluffy" } ];
  var expected = function(id) { return id == 1 ? "non-fluffy" : "fluffy"; }

  var j = $jinqs(first);
  var set = j.join(second,
                  function(f) { return f.id;  },
                  function(f) { return f.uid; }
                ).toArray();

  equals(set.length, 2);
  equals(set[0][1].key, expected(set[0][0].id));
  equals(set[1][1].key, expected(set[1][0].id));
  ok(set[0][0].id != set[0][1].id, "no duplicates");
});

test("join: should create multiple rows for each match.", function() {
  var first =  [ { id: 1, name: "jdp" } ];
  var second = [ { id: 1, uid: 1, key: "non-fluffy" }, { id: 2, uid: 1, key: "male" } ];

  var j = $jinqs(first);
  var set = j.join(second,
                  function(f) { return f.id;  },
                  function(f) { return f.uid; }
                );

  
  equals(set.count(), 2);
  ok(set.any(function(d){ return d[1].key == "male"; }), "find male key");
  ok(set.any(function(d){ return d[1].key == "non-fluffy"; }), "find non-fluffy key");
  ok(set.all(function(d){ return d[0].name == "jdp"; }), "all identical users")
});


// groupBy(keySelector, resultSelector)
test("groupBy: should be able to collect joined values.", function() {
  var first =  [ { id: 1, name: "jdp" } ];
  var second = [ { id: 1, uid: 1, key: "non-fluffy" }, { id: 2, uid: 1, key: "male" } ];

  var j = $jinqs(first);
  var set = j.join(second,function(f) { return f.id;  },function(f) { return f.uid; })
                .groupBy(
                  function(data) { return data[0].id; }
                  ).toArray();

  equals(set.length, 1);
  equals(set[0].length, 2);
  ok($jinqs(set[0][1]).any(function(d){ return d[1].key == "male"; }), "find male key");
  ok($jinqs(set[0][1]).any(function(d){ return d[1].key == "non-fluffy"; }), "find non-fluffy key");
});


// groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector)
test("groupJoin: should perform grouping on a join source automatically.", function() {
  var first =  [ { id: 1, name: "jdp" } ];
  var second = [ { id: 1, uid: 1, key: "non-fluffy" }, { id: 2, uid: 1, key: "male" } ];

  var j = $jinqs(first);
  var set = j.groupJoin(second,
           function(f) { return f.id;  },
           function(f) { return f.uid; })
                .toArray();

  equals(set.length, 1);
  equals(set[0].length, 2);
  ok($jinqs(set[0][1]).any(function(d){ return d.key == "male"; }), "find male key");
  ok($jinqs(set[0][1]).any(function(d){ return d.key == "non-fluffy"; }), "find non-fluffy key");
});

test("groupJoin: should get elements that have no matching values.", function() {
  var first =  [ { id: 1, name: "jdp" } ];
  var second = [ { id: 1, uid: 2, key: "non-fluffy" }, { id: 2, uid: 2, key: "male" } ];

  var j = $jinqs(first);
  var set = j.groupJoin(second,
           function(f) { return f.id;  },
           function(f) { return f.uid; })
                .toArray();

  equals(set.length, 1);
  equals(set[0][1].length, 0);
});


// union(inner, keySelector)
