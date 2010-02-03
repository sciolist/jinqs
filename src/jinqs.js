if(typeof Ken == "undefined") Ken = { };
$jinqs = function(data) { return new Ken.Jinqs(data); } 

/// Class: Ken.Jinqs
///  Supplies data querying capabilities using query expressions.

/// Method: new Ken.Jinqs
///  Creates a new <Ken.Jinqs> instance.
/// Parameters:
///  data - The data source to be enumerated, attempts to automatically create an enumerable source from the value.
Ken.Jinqs = function(data) {
  if(!arguments.length) { data = []; }
  if(data.getEnumerator) { data = data.getEnumerator(); }
  if(!(data instanceof Ken.Enumerator)) { data = Ken.Enumerator.over(data); }
  this.data = data;
};

Ken.Jinqs.prototype = {
  reset: function() { this.data.reset(); },
  
  /// Method: getEnumerator
  ///  Gets the underlying <Ken.Enumerator> to iterate the expression results.
  /// Returns:
  ///  A <Ken.Enumerator> iterating over the sequence.
  getEnumerator: function() { return this.data; },
  
  /// Method: each
  ///  Executes a method over every item in the sequence.
  /// Parameters:
  ///  predicate - The method target for invocations, enumeration halts if the method returns false.
  each: function(predicate)
  {
    var enumr = this.getEnumerator();
    while(enumr.moveNext() && predicate(enumr.current()) !== false) { }
    enumr.reset();
  },
  
  /// Method: toArray
  ///  Creates an array of the sequences data.
  /// Returns:
  ///  An array with the elements from the sequence.
  toArray: function()
  {
    var result = [];
    var enumr = this.getEnumerator();
    while(enumr.moveNext()) {
      result.push(enumr.current());
    }
    enumr.reset();
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
  toObject: function(keySelector, valueSelector, requireUniqueKeys)
  {
    var result = {};
    var enumr = this.getEnumerator();
    while(enumr.moveNext()) {
      var item = enumr.current();
      var key = keySelector?keySelector(item):item;
      var value = valueSelector?valueSelector(item):item;
      if(requireUniqueKeys && result.hasOwnProperty(key)) {
        throw "The resulting key already exists in the result set";
      }
      result[key] = value;
    }
    enumr.reset();
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
  toLookup: function(keySelector, valueSelector)
  {
    var result = {};
    var enumr = this.getEnumerator();
    while(enumr.moveNext()) {
      var item = enumr.current();
      var key = keySelector?keySelector(item):item;
      var value = valueSelector?valueSelector(item):item;
      if(!result[key]) { result[key] = []; }
      result[key].push(value);
    }
    enumr.reset();
    return result;
  },
  
  /// Method: orderBy
  ///  Sorts the elements in the sequence by a key, using a comparison function.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  A <Ken.Jinqs> instance that will sort the data on initialization.
  orderBy: function(keySelector, comparer)
  {
    var results = null;
    if(!comparer) { comparer = Ken.quickSort.defaultComparer; }
    var query = new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset: function() {
        if(results) { results.reset(); }
        this.reset();
      },
      moveNext: function(done) {
        if(results === null) {
          var prepared = this.select(function(item) { return [keySelector?keySelector(item):item, item]; });
          var sorted = Ken.quickSort(prepared, function(i){return i[0];}, comparer);
          results = new Ken.Jinqs(sorted).select(function(i) { return i[1]; }).getEnumerator();
        }
        while(results.moveNext()) {
          return results.current();
        }
        return done;
      }
    }));
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
  ///  A <Ken.Jinqs> instance that will sort the data in descending order on initialization.
  orderByDesc: function(keySelector, comparer)
  {
    if(!comparer) { comparer = Ken.quickSort.defaultComparer; }
    return this.orderBy(keySelector, function(a, b){ return -comparer(a, b); });
  },
  
  /// Method: thenBy
  ///  Sorts elements that have an active <orderBy> running on them, adding a lower importance sort.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  A <Ken.Jinqs> instance that will sort the data on initialization.
  thenBy: function(keySelector, comparer)
  {
    if(!this.orderByComparer) { return this.orderBy(keySelector, comparer); }
    if(!comparer) { comparer = Ken.quickSort.defaultComparer; }
    
    var oldMethod = this.orderByMethod;
    var oldComparer = this.orderByComparer;
    var newComparer = function(a, b, dataA, dataB) {
      var oldA = oldMethod(dataA[1]);
      var oldB = oldMethod(dataB[1]);
      var result = oldComparer(oldA, oldB, dataA, dataB);
      if(result === 0) {
        result = comparer(a, b, dataA, dataB);
      }
      return result;
    };
    return this.orderBy(keySelector, newComparer);
  },
  
  /// Method: thenByDesc
  ///  Sorts elements that have an active <orderBy> running on them, adding a lower importance descending sort.
  /// Parameters:
  ///  keySelector - A method with extracts a key from the element to sort the data on. (optional)
  ///  comparer    - A comparison method which takes two elements and returns a sorting direction. (optional)
  /// Returns:
  ///  A <Ken.Jinqs> instance that will sort the data in descending order on initialization.
  thenByDesc: function(keySelector, comparer)
  {
    if(!comparer) { comparer = Ken.quickSort.defaultComparer; }
    return this.thenBy(keySelector, function(a, b){ return -comparer(a, b); });
  },
  
  /// Method: any
  ///  Determines whether any elements exist which satisfy a predicate.
  /// Parameters:
  ///  predicate - A function to test each element against. (optional)
  /// Returns:
  ///  true if an element was found that matched the predicate, otherwise false.
  any: function(predicate)
  {
    var enumr = this.where(predicate).getEnumerator();
    var found = enumr.moveNext();
    enumr.reset();
    return found;
  },
  
  /// Method: all
  ///  Determines whether all elements satisfy a predicate.
  /// Parameters:
  ///  predicate - A function to test each element against.
  /// Returns:
  ///  true if all elements matched the predicate, otherwise false.
  all: function(predicate)
  {
    return !this.where(function(item) { return !predicate(item); }).any();
  },
  
  /// Method: contains
  ///  Determines whether an element exist in the sequence.
  /// Parameters:
  ///  value - The element to attempt to find.
  /// Returns:
  ///  true if the element was found, otherwise false.
  contains: function(value)
  {
    return this.any(function(item) { return item == value; });
  },
  
  /// Method: distinct
  ///  Returns a set of all distinct values in the sequence.
  /// Parameters:
  ///  uniqueKeySelector - A method to extract the key to judge distinctness by. (optional)
  /// Returns:
  ///  A <Ken.Jinqs> instance over all distinct elements that were found.
  distinct: function(uniqueKeySelector)
  {
    var keys = {};
    return this.where(function(item) {
      var key = (uniqueKeySelector ? uniqueKeySelector(item) : item);
      if(keys.hasOwnProperty(key)) { return false; }
      keys[key] = true;
      return true;
    });
  },
  
  /// Method: elementAt
  ///  Returns the element at the specified index in the sequence.
  /// Parameters:
  ///  index - The zero-based index of the element to retrieve.
  ///  defaultValue - A value to return if there was no element at the index. (optional)
  /// Returns:
  ///  The element at the specified index, or the default value if one was supplied.
  elementAt: function(index, defaultValue)
  {
    if(index < 0) { return defaultValue; }
    return this.skip(index).first(null, defaultValue);
  },
  
  /// Method: select
  ///  Maps each element into a new value using a selection method.
  /// Parameters:
  ///  selector - A transform function to apply to each element of the sequence.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the mapped results of the sequence.
  select: function(selector)
  {
    if(!selector) { return new Ken.Jinqs(this); }
    var data = null;
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset: function() { data = null; this.reset(); },
      current: function() { return data || (data = selector(this.data.current())); },
      moveNext: function(done) {
        data = null;
        while(this.data.moveNext()) { return true; }
        return false;
      }
    }));
  },
  
  /// Method: select
  ///  Maps each element into a new value using a selection method, and flattens the result.
  /// Parameters:
  ///  selector - A transform function to apply to each element of the sequence. (optional)
  /// Returns:
  ///  A <Ken.Jinqs> instance over the flattened and mapped results of the sequence.
  selectMany: function(selector)
  {
    var i = 0;
    var enumr = this.select(selector).getEnumerator();
    return new Ken.Jinqs(new Ken.Enumerator({
      reset:    function() { enumr.reset(); i = 0; },
      moveNext: function(done) {
        var item = enumr.current();
        while(!item || !item.length || i>=item.length) {
          if(!enumr.moveNext()) { return done; }
          item = selector ? selector(enumr.current()) : enumr.current();
          i = 0;
        }
        return item[i++];
      }
    }));
  },
  
  /// Method: concat
  ///  Concatenates two sequences.
  /// Parameters:
  ///  sequence - The sequence to be concatenate into the result, this can be any enumerable source.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the concatenated elements of the sequence.
  concat: function(sequence)
  {
    var enumr = sequence.moveNext ? sequence : Ken.Enumerator.over(sequence);
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset: function() { this.reset(); enumr.reset(); },
      moveNext: function(done) {
        while(this.data.moveNext()) { return this.data.current(); }
        while(enumr.moveNext()) { return enumr.current(); }
        return done;
      }
    }));
  },
  
  /// Method: where
  ///  Filters the values of the sequence by a predicate.
  /// Parameters:
  ///  predicate - A function to test whether an element should be included.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the filtered elements.
  where: function(predicate)
  {
    var i = 0;
    if(!predicate) { return new Ken.Jinqs(this); }
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset: function() { this.reset(); i = 0; },
      moveNext: function(done, i) {
        while(this.data.moveNext())
        {
          var item = this.data.current();
          if(predicate(item, i++)) { return item; }
        }
        return done;
      }
    }));
  },
  
  /// Method: first
  ///  Returns the first element in the sequence which satisfies the predicate.
  /// Parameters:
  ///  predicate    - A function to test each element.
  ///  defaultValue - A value to return if there was no element at the index. (optional)
  /// Returns:
  ///  The first element which matches the predicate, or the default value if one was supplied.
  first: function(predicate, defaultValue)
  {
    var enumr = this.where(predicate).getEnumerator();
    while(enumr.moveNext()) {
      var result = enumr.current();
      enumr.reset();
      return result;
    }
    enumr.reset();
    return defaultValue;
  },
  
  /// Method: last
  ///  Returns the last element in the sequence which satisfies the predicate.
  /// Parameters:
  ///  predicate    - A function to test each element.
  ///  defaultValue - A value to return if there was no element at the index. (optional)
  /// Returns:
  ///  The last element which matches the predicate, or the default value if one was supplied.
  last: function(predicate, defaultValue)
  {
    var last = null;
    var enumr = this.where(predicate).getEnumerator();
    while(enumr.moveNext()) { last = enumr.current(); }
    enumr.reset();
    return last;
  },
  
  /// Method: reverse
  ///  Inverts the order of the elements in the sequence.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the elements in the current sequence in reverse order.
  reverse: function()
  {
    var result = null;
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset: function() {
        if(result) { result.reset(); }
        this.reset();
      },
      moveNext: function(done) {
        if(result === null) {
          var arr = [];
          var enumr = this.getEnumerator();
          while(enumr.moveNext()) { arr.unshift(enumr.current()); }
          enumr.reset();
          result = new Ken.Enumerator(arr);
        }
        while(result.moveNext()) {
          return result.current();
        }
        return done;
      }
    }));
  },
  
  /// Method: takeWhile
  ///  Retrieves elements from the sequence as long as the predicate matches.
  /// Parameters:
  ///  predicate - A function to test each element against.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the elements before the predicate stopped matching.
  takeWhile: function(predicate)
  {
    var i = 0;
    if(!predicate) { return new Ken.Jinqs(this); }
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset:    function() { i = 0; this.reset(); },
      moveNext: function(done) {
        while(this.data.moveNext()) {
          var item = this.data.current();
          if(!predicate(item, i++)) { return done; }
          return item;
        }
        return done;
      }
    }));
  },
  
  /// Method: skipWhile
  ///  Skips elements from the sequence as long as the predicate matches.
  /// Parameters:
  ///  predicate - A function to test each element against.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the elements after the predicate stopped matching.
  skipWhile: function(predicate)
  {
    var skipping = true;
    if(!predicate) { return new Ken.Jinqs(); }
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset: function() { skipping = true; this.reset(); },
      moveNext: function(done) {
        while(this.data.moveNext()) {
          var item = this.data.current();
          if(!skipping) { return item; }
          if(predicate(item)) { continue; }
          
          skipping = false;
          return item;
        }
        return done;
      }
    }));
  },
  
  /// Method: take
  ///  Retrieves a specified amount of elements from the start of the sequence.
  /// Parameters:
  ///  count - The maximum number of elements to return.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the supplied amount of elements from the sequence.
  take: function(count)
  {
    var i = 0;
    var current = null;
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset:    function() { i = 0; this.reset(); current = null; },
      current:  function() { return this.data.current(); },
      moveNext: function() {
        if(i++ >= count) { return false; }
        return this.data.moveNext();
      }
    }));
  },
  
  /// Method: skip
  ///  Skips a specified amount of elements from the start of the sequence.
  /// Parameters:
  ///  count - The maximum number of elements to skip.
  /// Returns:
  ///  A <Ken.Jinqs> instance over the elements after those that were skipped.
  skip: function(count)
  {
    var i = 0;
    var current = null;
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset:    function() { i = 0; this.reset(); current = null; },
      current:  function() { return this.data.current(); },
      moveNext: function() {
        while(i++ < count) { this.data.moveNext(); }
        return this.data.moveNext();
      }
    }));
  },
  
  /// Method: aggregate
  ///  Folds the element using an accumulator method.
  /// Parameters:
  ///  seed           - The initial value of the accumulation. (optional)
  ///  accumulator    - A function that takes the current value, and next element value, and produces a new accumulated value.
  ///  resultSelector - A function that transforms the results of the accumulation.
  /// Returns:
  ///  The final accumulator value.
  aggregate: function(seed, accumulator, resultSelector)
  {
    if(seed instanceof Function) { return this.aggregate(0, seed, accumulator); }
    var enumr = this.getEnumerator();
    while(enumr.moveNext()) {
      seed = accumulator(seed, enumr.current());
    }
    enumr.reset();
    return resultSelector ? resultSelector(seed) : seed;
  },
  
  /// Method: count
  ///  Returns how many elements were found in the sequence that match a predicate.
  /// Parameters:
  ///  predicate - A function to test each element against. (optional)
  /// Returns:
  ///  The amount of elements that matched the predicate.
  count: function(predicate)
  {
    return this.where(predicate).aggregate(function(c, n){ return c + 1; });
  },
  
  /// Method: sum
  ///  Returns the summed value of the selector method run over every element in the sequence.
  /// Parameters:
  ///  selector - A transform function to get the accumulation value for an element. (optional)
  /// Returns:
  ///  The final summed result of the accumulation.
  sum: function(selector)
  {
    return this.select(selector).aggregate(function(c, n){return c + n; });
  },
  
  /// Method: min
  ///  Returns the lowest returned value of a selector in the sequence.
  /// Parameters:
  ///  selector - A transform function to get the value of an element. (optional)
  /// Returns:
  ///  The lowest value that was returned by the selector.
  min: function(selector)
  {
    return this.select(selector).aggregate(Infinity, Math.min);
  },
  
  /// Method: max
  ///  Returns the highest returned value of a selector in the sequence.
  /// Parameters:
  ///  selector - A transform function to get the value of an element. (optional)
  /// Returns:
  ///  The highest value that was returned by the selector.
  max: function(selector)
  {
    return this.select(selector).aggregate(-Infinity, Math.max);
  },
  
  /// Method: average
  ///  Returns the average of the values of a selector on the sequence.
  /// Parameters:
  ///  selector - A transform function to get the value of an element. (optional)
  /// Returns:
  ///  The average of all the values that were returned by the selector.
  average: function(selector)
  {
    var count = 0;
    var sum = this.select(selector).aggregate(function(c, n) { count++; return c + n; });
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
  ///  A <Ken.Jinqs> instance over the joined results of the sequences.
  groupJoin: function(inner, outerKeySelector, innerKeySelector, resultSelector)
  {
    var grouper = function(item) { return outerKeySelector(item[0]); };
  
    var joined = this.join(inner, outerKeySelector, innerKeySelector, null, true);
    return joined.groupBy(grouper, function(data) {
      var item = data[1];
      var query = new Ken.Jinqs(item);
      
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
  ///  A <Ken.Jinqs> instance where each value is a group of elements with matching keys.
  groupBy: function(keySelector, resultSelector)
  {
    var results = null;
    return new Ken.Jinqs(new Ken.Enumerator({
      scope: this,
      reset:    function() { 
        if(results) { results.reset(); }
        this.reset();
      },
      moveNext: function(done) {
        if(results === null) {
          var lookup = this.toLookup(keySelector);
          results = Ken.Enumerator.object(lookup);
        }
        while(results.moveNext()) {
          return resultSelector ? resultSelector(results.current()) : results.current();
        }
        return done;
      }
    }));
  },
  
  /// Method: union
  ///  Returns all distinct elements from two sequences.
  /// Parameters:
  ///  inner       - The sequence to be joined, this can be any enumerable source.
  ///  keySelector - A function to extract the key from an element.
  /// Returns:
  ///  A <Ken.Jinqs> instance over each distinct value from the sequences.
  union: function(inner, keySelector)
  {
    return this.concat(inner, keySelector).distinct(keySelector);
  },
  
  /// Method: intersect
  ///  Returns each distinct element that exists in both of two sources.
  /// Parameters:
  ///  inner       - The sequence to be joined, this can be any enumerable source.
  ///  keySelector - A function to extract the key from an element.
  /// Returns:
  ///  A <Ken.Jinqs> instance over each distinct value that exists in both sequences.
  intersect: function(inner, keySelector)
  {
    return this.join(inner, keySelector, keySelector, function(a, b) { return a; }).distinct(keySelector);
  },
  
  /// Method: join
  ///  Correlates the element from the current sequence with those of another based on matching keys.
  /// Parameters:
  ///  inner       - The sequence to be joined, this can be any enumerable source.
  ///  outerKeySelector - A function to extract the key from the current sequence. (optional)
  ///  innerKeySelector - A function to extract the key from the inner sequence. (optional)
  ///  resultSelector   - A function that creates a result from the outer element and an array of inner results. (optional)
  ///  outerJoin        - Indicates whether elements from the current sequence with no matching elements should be returned.
  join: function(inner, outerKeySelector, innerKeySelector, resultSelector, outerJoin)
  {
    var innerKeys = null;
    return this.select(function(item) {
      if (innerKeys === null) { innerKeys = new Ken.Jinqs(inner).toLookup(innerKeySelector); }
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
    }).selectMany();
  }
};
