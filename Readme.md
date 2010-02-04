Jinqs - JavaScript integrated queries!
======================================

Jinqs is a fluent data querying library in the spirit of [LINQ](http://en.wikipedia.org/wiki/Language_Integrated_Query) written in Javascript, 
providing helpers for traversing, sorting, mapping and aggregating information in an concise manner.

A typical Jinqs query looks something like

    closest = $jinqs(markers).orderBy(function(m) { return target.distanceFrom(m.getLatLng()); })
                             .take(10).toArray();

which iterates a set of [Google Maps](http://code.google.com/apis/maps/) markers 
and returns the 10 closest to a target location.


Enumeration
--------------------------------------

The majority of Jinqs methods create shells around enumerable iterators which defer execution of queries for as long as possible.
If you write a deferring Jinq query such as:

    var j = $jinqs([0,1,2,3,4]).where(function(v, i)  { return v > 2; })
                               .select(function(v) { return v * v; })
                               .min(); //> 9

you will end up with an enumerable source, which when invoked will poll the "select" iterator for its next valid member,
which in turn polls upwards to the "where" iterator. 
Invoking methods that will iterate the entire source, such as `toArray` will cause all required enumerations to execute immediately.


Data sources
--------------------------------------

There is support for several different types of data sources, the most obvious being an array of values.

    var j = $jinqs([0,null,2,"3",4]).where(function(v, i) { return v > 2; }).toArray(); //> ["3", 4]

It is also possible to create an iterator which takes its values from the result of method invocations.
This continues iterating the method until an 'undefined' value is returned (`return;`)

    var i  = 0;
    var fn = function() { return ++i; }
    
    var j = $jinqs(fn).select(Math.sqrt).takeWhile(function(v) { return v < 32; }).sum(); //> 21829.1..

An objects properties can also be used as a data source, which wraps them into arrays
to the effect that `{ id: 12 }` becomes `[['id',12]]`

    var value = { id0: [58,39929], id1: [12231,23] };
    
    var j = $jinqs(value).select(function(i) { return $jinqs(i[1]).sum(); }).average(); //> 26120.5

A final method for creating a data source is create a `Ken.Enumerator` directly, which
allows as much control as is possible on the enumeration procedure.

    var i = 0;
    var arr = [0,1,2,3,4,5];
    var enumr = new Ken.Enumerator({
        first: function() { i = 0; },   // invoked once after the enumerator is reset, as well as when its first iterated. (optional)
        reset: function() { i = 0; },   // called to reset the enumerator to its initial state.
        current: function() { return arr[i%2?i:arr.length-i]; }, // returns the element at the current state of the enumerator.
        moveNext: function() {   // iterates the source, returning true as long as it stays possible to iterate.
          i++;
          return i <= arr.length;
        }
    });
    
    $jinqs(enumr).toArray(); // [1, 4, 3, 2, 5, 0]

A slight variation on the same method is to omit the `current` method, in which case a marking
token is passed to the moveNext method which can be used to halt enumeration, and it would
otherwise return the new current value.

    var i = 0;
    var arr = [0,1,2,3,4,5];
    var enumr = new Ken.Enumerator({
        first: function() { i = 0; },   // invoked once after the enumerator is reset, as well as when its first iterated. (optional)
        reset: function() { i = 0; },   // called to reset the enumerator to its initial state.
        moveNext: function(done) {   // iterates the source, returning elements from it.
          i++;
          if(i <= arr.length) return arr[arr.length-i];
          return done;
        }
    });
    
    $jinqs(enumr).toArray(); // [5, 4, 3, 2, 1, 0]


Method groups
--------------------------------------

### Aggregation
The `aggregate([seed], accumulator, [resultSelector])` iterates over its source and applies an accumulator method
on every element.

    $jinqs([21,10,39]).aggregate(-Math.Infinity, Math.Max);

This is used by `average`, `count`, `min`, `sum`, `max` to provide common aggregations.


### Testing
The testing methods iterate over the array and return true if their conditions are met

 - `all(predicate)` - Returns whether every element in the data source matched the predicate.
 - `any(predicate)` - Returns whether any element in the data source matched the predicate.
 - `contains(value)` - Returns whether an element exists in the data source.


### Filtering
There are a few different filtering methods, the most common one being `where(predicate)` which filters elements
out of its source and returns those which match.

Other filters:

 - `distinct([uniqueKeySelector])` - Returns only the first element that returns each unique key through the selector.
 - `skip(count)` and `skipWhile(predicate)` - Creates a source that takes all elements after the last in the source that returns `true` on the predicate.
 - `take(count)` and `takeWhile(predicate)` - Creates a source that takes all elements before the first in the source that returns `true` on the predicate.


### Transforming data

The `select` method can be used to modify the data in the source with a transform method.

    $jinqs([1, 2, 3]).select(function(i) { return i * 2; }).toArray(); //> [2, 4, 6]

There is also a `selectMany` method, in which an array of values from the transform method is flattened into the output.

    $jinqs([1, 2, 3]).selectMany(function(i) { return [i, i*2]; }).toArray(); //> [1, 2, 2, 4, 3, 6]
    $jinqs([1, 2, 3]).select(function(i) { return [i, i*2]; }).toArray(); //> [[1, 2], [2, 4], [3, 6]]


### Getting values out of the enumerator

 - `each(predicate)` - Invokes a method for each element in the source, stopping if the method returns `false`.
 - `elementAt(index, [defaultValue])` - Iterates up to the index count, and returns the next element.
 - `first([predicate, defaultValue])` - Returns the first value that matches a predicate (or the optional defaultValue if none was found)
 - `last([predicate, defaultValue])` - Returns the last value that matches a predicate (or the optional defaultValue if none was found)
 - `getEnumerator()` - Returns the underlying enumerator, which can be used to iterate the values of the source directly.
 - `toArray()` - Returns all elements in the source in an array.
 - `toObject(keySelector, [valueSelector, requireUniqueKeys])` - Creates an associative array of key / value mappings that are supplied by selector methods.
 - `toLookup(keySelector, [valueSelector])` - Creates an associative array of keys mapped against arrays of values supplied by selector methods.


### Joining sources

#### join(inner, outerKeySelector, innerKeySelector, [resultSelector, outerJoin])
The `join` method takes elements from the source and maps them against another using key selectors.

    var outer = [{ id: 1, name: "jdp" }]
    var inner = [{ id: 1, uid: 1, tag: "joiner" }, { id: 2, uid: 1, tag: "another tag" }]
    
    $jinqs(outer).join(inner,
                  function(o) { return  o.id; },
                  function(i) { return i.uid; },
                  function(o, i) { return [o, i]; }).toArray();
     
     // this will create an array of joined values, which will contain
       [ { id: 1, name: "jdp" }, { id: 1, uid: 1, tag: "joiner" },
         { id: 1, name: "jdp" }, { id: 2, uid: 1, tag: "another tag" } ]

#### groupJoin(inner, outerKeySelector, innerKeySelector, [resultSelector])
A grouped join maps the outer values only once, and creates an array of inner results.

    var outer = [{ id: 1, name: "jdp" }]
    var inner = [{ id: 1, uid: 1, tag: "joiner" }, { id: 2, uid: 1, tag: "another tag" }]

    $jinqs(outer).groupJoin(inner,
                  function(o) { return  o.id; },
                  function(i) { return i.uid; },
                  function(o, i) { return {user: o, tags: i}; }).toArray();

     // this will create an array of grouped values, which will contain
       [ { user: { id: 1, name: "jdp" }, tags: [ { id: 1, uid: 1, tag: "joiner" }, 
                                                 { id: 2, uid: 1, tag: "another tag" } ]

#### groupBy(keySelector, [resultSelector])
The group by method iterates over itself, making arrays of each value that matches a given key.

    var outer = [{ id: 1, name: "jdp", office: 1 }, { id: 2, name: "ej", office: 0 }, { id: 3, name: "be", office: 1 }]
    
    $jinqs(outer).groupBy(function(o) { return o.office; }, function(k, o) { return { office: k, users: o }; });
    
    // this will create an array of grouped values, which will contain
    [ { office: 0, users: [ { id: 1, name: "jdp", office: 1 }, { id: 3, name: "be", office: 1 } },
      { office: 1, users: [ { id: 2, name: "ej", office: 0 } ] } ]

#### concat(sequence)
Concat appends another data source, which will be iterated after the current one.

    $jinqs([0,1]).concat([2,3]); //> [0,1,2,3]

#### intersect(inner, keySelector)
Intersect finds all elements that match the same key selector between two sources.

    $jinqs([0,1,2]).intersect([1,2,3]); //> [1,2]

#### union(inner, keySelector)
Union finds and returns all values that are distinct among two sources.

    $jinqs([0,1,2]).union([1,2,3]); //> [0,1,2,3]


### Sorting

There are sorting order methods for iterating ascending and descending through a data source, as well as supplying multiple sorts with descending relevance..

    var a = [ { val: 1, name: "abba" }, { val: 2, name: "zorro" }, { val: 1, name: "queen" } ];
    
    $jinqs(a).orderByDesc(function(i) { return i.val; })
             .thenBy(function(i) { return i.name; })
             .thenByDesc(function(i) { return i.id; })
    
    // This will produce a source containing:
    [ { val: 2, name: "zorro" },
      { val: 1, name: "abba"  },
      { val: 1, name: "queen" } ]

A comparer can optionally be applied, which returns a direction (-1 when a is less than b, 0 for a equaling b, 1 for a is less than b) for the sorter.

 - `orderBy(keySelector, [comparer])` - Performs a primary sort on a key.
 - `orderByDesc(keySelector, [comparer])` - Performs a descending primary sort on a key.
 - `thenBy(keySelector, [comparer])` - Performs a secondary sort on a key, sorting only values which are compared to '0' by the parent.
 - `thenByDesc(keySelector, [comparer])` - Performs a descending secondary sort on a key, sorting only values which are compared to '0' by the parent.
 - `reverse()` - Returns the data source iterated in the reverse order.
