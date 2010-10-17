if(typeof jinqs == "undefined") { jinqs = { }; }
if(typeof exports != "undefined") { exports.jinqs = jinqs; }


jinqs.over = function(data) { return new jinqs.Core(data); }
jinqs.count = function(start, count) {
  return jinqs.over({
    reset: function() { this.i = start-1; },
    moveNext: function(done) {
      this.i += 1;
      if(this.i>=start+count) return done;
      return this.i;
    } 
  });
}

/// Class: jinqs.Core
///  Supplies data querying capabilities using query expressions.

/// Method: new jinqs.Core
///  Creates a new <jinqs.Core> instance.
/// Parameters:
///  data - The data source to be enumerated, attempts to automatically create an enumerable source from the value.
jinqs.Core = function(data) {
  if(!arguments.length) { data = []; }
  this.data = data;
};

/// Static Method: addMethod
///  Registers a jinqs function.
/// Parameters:
///  name   - Name of the method to register.
///  method - Function to invoke when a linqs query is performed.
jinqs.Core.addMethod = function(name, method) {
  jinqs.Core.prototype[name] = function() {
    var args = [this];
    for(var i=0; i<arguments.length; ++i) args.push(arguments[i]);
    return method.apply(this, args);
  }
};

/// Static Method: addMethods
///  Registers a set of jinqs functions.
/// Parameters:
///  source - An object containing the jinqs functions to add.
jinqs.Core.addMethods = function(source) {
  for(var item in source) {
    if(source.hasOwnProperty(item)) {
      jinqs.Core.addMethod(item, source[item]);
    }
  }
};

jinqs.Core.addMethods({
  /// Method: getEnumerator
  ///  Gets the underlying <jinqs.Enumerator> to iterate the expression results.
  /// Returns:
  ///  A <jinqs.Enumerator> iterating over the sequence.
  getEnumerator: function(source) { return jinqs.Enumerator.over(source.data); },
  
  /// Method: each
  ///  Executes a method over every item in the sequence.
  /// Parameters:
  ///  predicate - The method target for invocations, enumeration halts if the method returns false.
  each: function(source, predicate) {
    var enumr = source.getEnumerator();
    while(enumr.moveNext() && predicate(enumr.current()) !== false) { }
  },
  
  /// Method: toArray
  ///  Creates an array of the sequences data.
  /// Returns:
  ///  An array with the elements from the sequence.
  toArray: function(source) {
    var result = [];
    var enumr = source.getEnumerator();
    while(enumr.moveNext()) {
      result.push(enumr.current());
    }
    return result;
  },
  
  /// Method: toObject
  ///  Creates an associative array of the sequences data, with each key mapped to a value.
  /// Parameters:
  ///  keySelector       - A method which extracts a key from each element. (optional)
  ///  valueSelector     - A method which selects a value from each element. (optional)
  ///  requireUniqueKeys - Indicates whether a test should be performed to ensure uniqueness of keys.
  /// Returns:
  ///  An object containing values from the sequence, retrievable by their key.
  toObject: function(source, keySelector, valueSelector, requireUniqueKeys) {
    var result = {};
    var enumr = source.getEnumerator();
    while(enumr.moveNext()) {
      var item = enumr.current();
      var key = keySelector?keySelector(item):item;
      var value = valueSelector?valueSelector(item):item;
      if(requireUniqueKeys && result.hasOwnProperty(key)) {
        throw "The resulting key already exists in the result set";
      }
      result[key] = value;
    }
    return result;
  },
  
  /// Method: toLookup
  ///  Creates an associative array of the sequences elements, with each key 
  ///  mapped to an array of values with identical keys.
  /// Parameters:
  ///  keySelector   - A method which extracts a key from each element. (optional)
  ///  valueSelector - A method which selects a value from each element. (optional)
  /// Returns:
  ///  An object containing arrays of values from the sequence, retrievable by their key.
  toLookup: function(source, keySelector, valueSelector) {
    var result = {};
    var enumr = source.getEnumerator();
    while(enumr.moveNext()) {
      var item = enumr.current();
      var key = keySelector?keySelector(item):item;
      var value = valueSelector?valueSelector(item):item;
      if(!result[key]) { result[key] = []; }
      result[key].push(value);
    }
    return result;
  },
  
  /// Method: orderBy
  ///  Sorts the elements in the sequence by a key, using a comparison function.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  An enumeration that will sort the data on initialization.
  orderBy: function(source, keySelector, comparer) {
    if(!comparer) { comparer = jinqs.quickSort.defaultComparer; }
    
    var query = new jinqs.Core({
      reset: function() {
        if(this.inner) { this.inner.reset(); }
      },
      moveNext: function(done) {
        if(!this.inner) {
          var prepared = source.select(function(item) { return [keySelector?keySelector(item):item, item]; });
          var sorted = jinqs.quickSort(prepared, function(i){return i[0];}, comparer);
          this.inner = new jinqs.Core(sorted).select(function(i) { return i[1]; }).getEnumerator();
        }
        while(this.inner.moveNext()) {
          return this.inner.current();
        }
        return done;
      }
    });
    query.orderByMethod = keySelector;
    query.orderByComparer = comparer;
    return query;
  },
  
  /// Method: orderBy
  ///  Sorts the elements in the sequence by a key in descending order, using a comparison function.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  An enumeration that will sort the data in descending order on initialization.
  orderByDesc: function(source, keySelector, comparer) {
    if(!comparer) { comparer = jinqs.quickSort.defaultComparer; }
    return source.orderBy(keySelector, function(a, b){ return -comparer(a, b); });
  },
  
  /// Method: thenBy
  ///  Sorts elements that have an active <orderBy> running on them, adding a lower importance sort.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  An enumeration that will sort the data on initialization.
  thenBy: function(source, keySelector, comparer) {
    if(!source.orderByComparer) { return source.orderBy(keySelector, comparer); }
    if(!comparer) { comparer = jinqs.quickSort.defaultComparer; }
    
    var oldMethod = source.orderByMethod;
    var oldComparer = source.orderByComparer;
    var newComparer = function(a, b, dataA, dataB) {
      var oldA = oldMethod ? oldMethod(dataA[1]) : dataA[1];
      var oldB = oldMethod ? oldMethod(dataB[1]) : dataB[1];
      var result = oldComparer(oldA, oldB, dataA, dataB);
      if(result === 0) {
        result = comparer(a, b, dataA, dataB);
      }
      return result;
    };
    return source.orderBy(keySelector, newComparer);
  },
  
  /// Method: thenByDesc
  ///  Sorts elements that have an active <orderBy> running on them, adding a lower importance descending sort.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  An enumeration that will sort the data in descending order on initialization.
  thenByDesc: function(source, keySelector, comparer) {
    if(!comparer) { comparer = jinqs.quickSort.defaultComparer; }
    return source.thenBy(keySelector, function(a, b){ return -comparer(a, b); });
  },
  
  /// Method: any
  ///  Determines whether any elements exist which satisfy a predicate.
  /// Parameters:
  ///  predicate - A function to test each element against. (optional)
  /// Returns:
  ///  true if an element was found that matched the predicate, otherwise false.
  any: function(source, predicate) {
    var enumr = source.where(predicate).getEnumerator();
    return enumr.moveNext();
  },
  
  /// Method: all
  ///  Determines whether all elements satisfy a predicate.
  /// Parameters:
  ///  predicate - A function to test each element against.
  /// Returns:
  ///  true if all elements matched the predicate, otherwise false.
  all: function(source, predicate) {
    return !source.where(function(item) { return !predicate(item); }).any();
  },
  
  /// Method: contains
  ///  Determines whether an element exist in the sequence.
  /// Parameters:
  ///  value - The element to attempt to find.
  /// Returns:
  ///  true if the element was found, otherwise false.
  contains: function(source, value) {
    return source.any(function(item) { return item == value; });
  },
  
  /// Method: distinct
  ///  Returns a set of all distinct values in the sequence.
  /// Parameters:
  ///  uniqueKeySelector - A method to extract the key to judge distinctness by. (optional)
  /// Returns:
  ///  An enumeration over all distinct elements that were found.
  distinct: function(source, uniqueKeySelector) {
    return new jinqs.Core({
      first: function() {
        this.inner = source.getEnumerator();
        this.keys = { }
      },
      moveNext: function(done) {
        while(this.inner.moveNext()) {
          var item = this.inner.current();
          var key = (uniqueKeySelector ? uniqueKeySelector(item) : item);
          if(this.keys.hasOwnProperty(key)) { continue; }
          this.keys[key] = true;
          return item;
        };
        return done;
      }
    });
  },
  
  /// Method: elementAt
  ///  Returns the element at the specified index in the sequence.
  /// Parameters:
  ///  index - The zero-based index of the element to retrieve.
  ///  defaultValue - A value to return if there was no element at the index. (optional)
  /// Returns:
  ///  The element at the specified index, or the default value if one was supplied.
  elementAt: function(source, index, defaultValue) {
    if(index < 0) { return defaultValue; }
    return source.skip(index).first(null, defaultValue);
  },
  
  /// Method: select
  ///  Maps each element into a new value using a transform function.
  /// Parameters:
  ///  transform - A transform function to apply to each element of the sequence.
  /// Returns:
  ///  An enumeration over the mapped results of the sequence.
  select: function(source, transform) {
    if(!transform) { return new jinqs.Core(source); }
    
    return new jinqs.Core({
      first: function() { this.inner = source.getEnumerator(); },
      current: function() { return transform(this.inner.current()); },
      moveNext: function() { return this.inner.moveNext(); }
    });
  },
  
  /// Method: select
  ///  Maps each element into a new value using a selection method, and flattens the result.
  /// Parameters:
  ///  selector - A transform function to apply to each element of the sequence. (optional)
  /// Returns:
  ///  An enumeration over the flattened and mapped results of the sequence.
  selectMany: function(source, transform) {
    return new jinqs.Core({
      first: function() { this.i = 0; this.inner = source.select(transform).getEnumerator(); },
      moveNext: function(done) {
        var item = this.inner.current();
        while(!item || !item.length || this.i>=item.length) {
          if(!this.inner.moveNext()) { return done; }
          item = this.inner.current();
          this.i = 0;
        };
        return item[this.i++];
      }
    });
  },
  
  /// Method: concat
  ///  Concatenates two sequences.
  /// Parameters:
  ///  sequence - The sequence to be concatenate into the result, this can be any enumerable source.
  /// Returns:
  ///  An enumeration over the concatenated elements of the sequence.
  concat: function(source, sequence) {
    if(!sequence) { return new jinqs.Core(source); }
    
    return new jinqs.Core({
      first: function() {
        this.inner = source.getEnumerator();
        this.outer = jinqs.Enumerator.over(sequence);
      },
      moveNext: function(done) {
        while(this.inner.moveNext()) { return this.inner.current(); }
        while(this.outer.moveNext()) { return this.outer.current(); }
        return done;
      }
    });
  },
  
  /// Method: where
  ///  Filters the values of the sequence by a predicate.
  /// Parameters:
  ///  predicate - A function to test whether an element should be included.
  /// Returns:
  ///  An enumeration over the filtered elements.
  where: function(source, predicate) {
    if(!predicate) { return new jinqs.Core(source); }
    
    return new jinqs.Core({
      first: function() { this.inner = source.getEnumerator(); this.i = 0; },
      moveNext: function(done) {
        while(this.inner.moveNext()) {
          var item = this.inner.current();
          if(!predicate || predicate(item, this.i++)) { return item; }
        };
        return done;
      }
    })
  },
  
  /// Method: first
  ///  Returns the first element in the sequence which satisfies the predicate.
  /// Parameters:
  ///  predicate    - A function to test each element.
  ///  defaultValue - A value to return if there was no element at the index. (optional)
  /// Returns:
  ///  The first element which matches the predicate, or the default value if one was supplied.
  first: function(source, predicate, defaultValue) {
    var enumr = source.where(predicate).getEnumerator();
    while(enumr.moveNext()) {
      return enumr.current();
    }
    return defaultValue;
  },
  
  /// Method: last
  ///  Returns the last element in the sequence which satisfies the predicate.
  /// Parameters:
  ///  predicate    - A function to test each element.
  ///  defaultValue - A value to return if there was no element at the index. (optional)
  /// Returns:
  ///  The last element which matches the predicate, or the default value if one was supplied.
  last: function(source, predicate, defaultValue) {
    var last = null;
    var enumr = source.where(predicate).getEnumerator();
    if(!enumr.moveNext()) { return defaultValue; }
    
    do {
      last = enumr.current();
    } while(enumr.moveNext());
    return last;
  },
  
  /// Method: reverse
  ///  Inverts the order of the elements in the sequence.
  /// Returns:
  ///  An enumeration over the elements in the current sequence in reverse order.
  reverse: function(source) {
    return new jinqs.Core({
      first: function() {
        if(this.inner) { this.inner.reset(); return; };
        var arr = [];
        var enumr = source.getEnumerator();
        while(enumr.moveNext()) {
          arr.unshift(enumr.current());
        }
        this.inner =jinqs.Enumerator.over(arr);
      },
      moveNext: function(done) {
        while(this.inner.moveNext()) {
          return this.inner.current();
        }
        return done;
      }
    });
  },
  
  /// Method: takeWhile
  ///  Retrieves elements from the sequence as long as the predicate matches.
  /// Parameters:
  ///  predicate - A function to test each element against.
  /// Returns:
  ///  An enumeration over the elements before the predicate stopped matching.
  takeWhile: function(source, predicate) {
    if(!predicate) { return new jinqs.Core(this.data); }
    return new jinqs.Core({
      first: function() { this.i = 0; this.inner = source.getEnumerator(); },
      moveNext: function(done) {
        while(this.inner.moveNext()) {
          var item = this.inner.current();
          if(!predicate(item, this.i++)) { return done; }
          return item;
        }
        return done;
      }
    });
  },
  
  /// Method: skipWhile
  ///  Skips elements from the sequence as long as the predicate matches.
  /// Parameters:
  ///  predicate - A function to test each element against.
  /// Returns:
  ///  An enumeration over the elements after the predicate stopped matching.
  skipWhile: function(source, predicate) {
    if(!predicate) { return new jinqs.Core(this.data); }
    return new jinqs.Core({
      first: function() {
        this.i = 0;
        this.skipping = true;
        this.inner = source.getEnumerator();
      },
      moveNext: function(done) {
        while(this.inner.moveNext()) {
          var item = this.inner.current();
          if(!this.skipping) { return item; }
          if(predicate(item, this.i++)) { continue; }
          
          this.skipping = false;
          return item;
        }
        return done;
      }
    });
  },
  
  /// Method: take
  ///  Retrieves a specified amount of elements from the start of the sequence.
  /// Parameters:
  ///  count - The maximum number of elements to return.
  /// Returns:
  ///  An enumeration over the supplied amount of elements from the sequence.
  take: function(source, count) {
    return new jinqs.Core({
      first: function() {
        this.i = 0;
        this.inner = source.getEnumerator();
      },
      current:  function() { return this.inner.current(); },
      moveNext: function() {
        if(this.i++ >= count) { return false; }
        return this.inner.moveNext();
      }
    });
  },
  
  /// Method: skip
  ///  Skips a specified amount of elements from the start of the sequence.
  /// Parameters:
  ///  count - The maximum number of elements to skip.
  /// Returns:
  ///  An enumeration over the elements after those that were skipped.
  skip: function(source, count) {
    return new jinqs.Core({
      first: function() {
        this.i = 0;
        this.inner = source.getEnumerator();
      },
      current:  function() { return this.inner.current(); },
      moveNext: function() {
        while(this.i++ < count) { this.inner.moveNext(); }
        return this.inner.moveNext();
      }
    });
  },
  
  /// Method: zip
  ///  Merges elements from the sequence with a secondary source.
  /// Parameters:
  ///  sequence - The sequence to be merge into the source, this can be any enumerable source.
  ///  predicate - An optional method that receives the elements from the first and second source, and returns a result value.
  /// Returns:
  ///  An enumeration over the results of the zip operation.
  zip: function(source, sequence, predicate) {
    return new jinqs.Core({
      first: function() {
        this.inner = jinqs.over(source).getEnumerator();
        this.outer = jinqs.over(sequence).getEnumerator();
      },
      moveNext: function() {
        this.outer.moveNext();
        return this.inner.moveNext();
      },
      current: function() {
        var innerKey = this.inner.current();
        var outerKey = this.outer.current();
        return predicate ? predicate(innerKey, outerKey) : [innerKey, outerKey];
      }
    });
  },
  
  /// Method: aggregate
  ///  Folds the element using an accumulator method.
  /// Parameters:
  ///  seed           - The initial value of the accumulation. (optional)
  ///  accumulator    - A function that takes the current value, and next element value, and produces a new accumulated value.
  ///  resultSelector - A function that transforms the results of the accumulation.
  /// Returns:
  ///  The final accumulator value.
  aggregate: function(source, seed, accumulator, resultSelector) {
    if(seed instanceof Function) { return source.aggregate(0, seed, accumulator); }
    var enumr = source.getEnumerator();
    while(enumr.moveNext()) {
      seed = accumulator(seed, enumr.current());
    }
    return resultSelector ? resultSelector(seed) : seed;
  },
  
  /// Method: count
  ///  Returns how many elements were found in the sequence that match a predicate.
  /// Parameters:
  ///  predicate - A function to test each element against. (optional)
  /// Returns:
  ///  The amount of elements that matched the predicate.
  count: function(source, predicate) {
    if(!predicate && source.data.length) return source.data.length;
    return source.where(predicate).aggregate(function(c, n){ return c + 1; });
  },
  
  /// Method: sum
  ///  Returns the summed value of the selector method run over every element in the sequence.
  /// Parameters:
  ///  selector - A transform function to get the accumulation value for an element. (optional)
  /// Returns:
  ///  The final summed result of the accumulation.
  sum: function(source, selector) {
    return source.select(selector).aggregate(function(c, n){return c + n; });
  },
  
  /// Method: min
  ///  Returns the lowest returned value of a selector in the sequence.
  /// Parameters:
  ///  selector - A transform function to get the value of an element. (optional)
  /// Returns:
  ///  The lowest value that was returned by the selector.
  min: function(source, selector) {
    return source.select(selector).aggregate(Infinity, Math.min);
  },
  
  /// Method: max
  ///  Returns the highest returned value of a selector in the sequence.
  /// Parameters:
  ///  selector - A transform function to get the value of an element. (optional)
  /// Returns:
  ///  The highest value that was returned by the selector.
  max: function(source, selector) {
    return source.select(selector).aggregate(-Infinity, Math.max);
  },
  
  /// Method: average
  ///  Returns the average of the values of a selector on the sequence.
  /// Parameters:
  ///  selector - A transform function to get the value of an element. (optional)
  /// Returns:
  ///  The average of all the values that were returned by the selector.
  average: function(source, selector) {
    var count = 0;
    var sum = source.select(selector).aggregate(function(c, n) { count++; return c + n; });
    return sum / count;
  },
  
  /// Method: groupJoin
  ///  Correlates the elements of two sequences based on their keys and groups the inner results.
  /// Parameters:
  ///  inner            - The sequence to be joined, this can be any enumerable source.
  ///  outerKeySelector - A function to extract the key from the current sequence. (optional)
  ///  innerKeySelector - A function to extract the key from the inner sequence. (optional)
  ///  resultSelector   - A function that creates a result from the outer element and an array of inner results. (optional)
  /// Returns:
  ///  An enumeration over the joined results of the sequences.
  groupJoin: function(source, inner, outerKeySelector, innerKeySelector, resultSelector) {
    var grouper = function(item) { return outerKeySelector(item[0]); };
    var joined = source.join(inner, outerKeySelector, innerKeySelector, null, true);
    
    return joined.groupBy(grouper, function(key, value) {
      var query = new jinqs.Core(value);
      
      var outerValue = query.first(null, [])[0];
      var innerValues = query.select(function(i){ return i[1]; }).where(function(i){ return i !== null; });
      return resultSelector ? resultSelector(outerValue, innerValues.toArray()) : [outerValue, innerValues.toArray()];
    });
  }, 
  
  /// Method: groupBy
  ///  Groups the elements of the sequence based on a key selector.
  /// Parameters:
  ///  keySelector - A function to extract the key from an element.
  ///  resultSelector - A function that creates a result for each group. (optional)
  /// Returns:
  ///  An enumeration where each value is a group of elements with matching keys.
  groupBy: function(source, keySelector, resultSelector) {
    return new jinqs.Core({
      reset: function() {
        if(this.inner) this.inner.reset();
      },
      first: function() {
        if(this.inner) { return; } // no need to recreate the lookup if it exists.
        var lookup = source.toLookup(keySelector);
        this.inner = jinqs.Enumerator.object(lookup);
      },
      moveNext: function(done) {
        while(this.inner.moveNext()) {
          var item = this.inner.current();
          return resultSelector ? resultSelector(item[0], item[1], item) : item;
        }
        return done;
      }
    });
  },
  
  /// Method: union
  ///  Returns all distinct elements from two sequences.
  /// Parameters:
  ///  inner       - The sequence to be joined, this can be any enumerable source.
  ///  keySelector - A function to extract the key from an element.
  /// Returns:
  ///  An enumeration over each distinct value from the sequences.
  union: function(source, inner, keySelector) {
    return source.concat(inner, keySelector).distinct(keySelector);
  },
  
  /// Method: intersect
  ///  Returns each distinct element that exists in both of two sources.
  /// Parameters:
  ///  inner       - The sequence to be joined, this can be any enumerable source.
  ///  keySelector - A function to extract the key from an element.
  /// Returns:
  ///  An enumeration over each distinct value that exists in both sequences.
  intersect: function(source, inner, keySelector) {
    return source.join(inner, keySelector, keySelector, function(a, b) { return a; }).distinct(keySelector);
  },
  
  /// Method: join
  ///  Correlates the element from the current sequence with those of another based on matching keys.
  /// Parameters:
  ///  inner       - The sequence to be joined, this can be any enumerable source.
  ///  outerKeySelector - A function to extract the key from the current sequence. (optional)
  ///  innerKeySelector - A function to extract the key from the inner sequence. (optional)
  ///  resultSelector   - A function that creates a result from the outer element and an array of inner results. (optional)
  ///  outerJoin        - Indicates whether elements from the current sequence with no matching elements should be returned.
  join: function(source, inner, outerKeySelector, innerKeySelector, resultSelector, outerJoin) {
    var innerKeys = null;
    return this.selectMany(function(item) {
      if (innerKeys === null) { innerKeys = new jinqs.Core(inner).toLookup(innerKeySelector); }
      var key = (outerKeySelector ? outerKeySelector(item) : item);
      var result = [];
      var innerValues = innerKeys[key];
      
      if(!innerValues) {
        if(outerJoin) { result.push(resultSelector ? resultSelector(item) : [item, null]); }
        return result;
      }
      for(var i=0; i<innerValues.length; i++) {
        var innerItem = innerValues[i];
        result.push(resultSelector ? resultSelector(item, innerItem) : [item, innerItem]);
      }
      return result;
    });
  }
});
