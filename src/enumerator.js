if(typeof Ken == "undefined") Ken = { };

/// Class: Ken.Enumerator
///  Supports iteration over a data source.

/// Method: new Ken.Enumerator
///  Creates a new <Ken.Enumerator> instance.
/// Parameters:
///  args - A configuration for the enumerator. (see <Arguments> section)
/// Arguments:
///  first - A method that is invoked the first time the instance is iterated over after a reset. (optional)
///  reset - A method that resets the state of the enumerator. (optional)
///  current - A method that returns the current value of the data source. (optional, see <Ken.Enumerator.basic> for details)
///  moveNext - A method that iterates over the source, returning true while more data is available. (see <Ken.Enumerator.basic> if no current value is supplied)
Ken.Enumerator = function(args)
{
  if(!args.current) { args = Ken.Enumerator.basicConfig(args); }
  args.first = args.first || args.reset;
  this.scope = this;
  this.args = args;
  this._bof = true;
  this._eof = false;
};

Ken.Enumerator.prototype = {
  /// Method: current
  ///  Gets the current element in the data source.
  /// Returns:
  ///  The current element in the data source.
  current: function()
  {
    if(!this._bof && !this._eof) { return this.args.current.call(this.scope); }
    return undefined;
  },
  
  getEnumerator: function() { return this; },
  
  /// Method: reset
  ///  Sets the enumerator to its initial position.
  reset: function()
  {
    if(this._bof) return;
    this._bof = true;
    this._eof = false;
    if(this.args.reset) { this.args.reset.call(this.scope); }
  },

  /// Method: moveNext
  ///  Advances the enumerator to the next element of the data source.
  /// Returns:
  ///  true if the enumerator advanced successfully, false if the enumerator has passed its last element.
  moveNext: function()
  {
    if(this._bof) {
      this.args.first.call(this.scope);
      this._bof = false;
    }
    this._eof = !this.args.moveNext.call(this.scope);
    return !this._eof;
  }
};

/// Static Method: over
///  Attempts to find a means of enumerating a source.
/// Parameters:
///  obj - The source to attempt to enumerate.
/// Returns:
///  A <Ken.Enumerator> instance over the supplied object.
Ken.Enumerator.over = function(obj)
{
  if(obj instanceof Ken.Enumerator) { return obj; }
  else if(obj.getEnumerator) { return obj.getEnumerator(); }
  else if(obj instanceof Function) { return Ken.Enumerator.func(obj); }
  else if(obj.length != null) { return Ken.Enumerator.array(obj); }
  else if(obj.moveNext instanceof Function) { return new Ken.Enumerator(obj); }
  else { return Ken.Enumerator.object(obj); }
};

/// Static Method: range
///  Creates an enumerator over a range of values.
/// Parameters:
///  from - The starting value of the enumeration.
///  to   - The final value of the enumeration.
///  step - The amount to increase or decrease with each step.
/// Returns:
///  A <Ken.Enumerator> instance over the requested range.
Ken.Enumerator.range = function(from, to, step)
{
  return new Ken.Enumerator({
    reset:    function() { this.i = from-1; },
    current:  function() { return this.i;   },
    moveNext: function() { this.i += step||1; return step<0 ? this.i>to : this.i<to; }
  });
};

/// Static Method: repeat
///  Creates an enumerator that returns a value an amount of times.
/// Parameters:
///  value - The value to be returned.
///  count - The amount of times to return the item.
/// Returns:
///  A <Ken.Enumerator> instance which returns the requested value.
Ken.Enumerator.repeat = function(value, count)
{
  if(arguments.length == 1) { count = value; value = 0; }
  return new Ken.Enumerator({
    reset:    function() { this.i = 0; },
    current:  function() { return value; },
    moveNext: function() { this.i++; return this.i<=count; }
  });
};

/// Static Method: array
///  Creates a new enumeration over an array.
/// Parameters:
///  arr  - The array to iterate over.
/// Returns:
///  A <Ken.Enumerator> instance over the array.
Ken.Enumerator.array  = function(arr)  { return new Ken.Enumerator(Ken.Enumerator.arrayConfig(arr));  };

/// Static Method: basic
///  Creates a new enumeration over a configuration object with an implied 'current' method (see remarks).
/// Parameters:
///  opts - The configuration for the enumeration.
/// Returns:
///  A <Ken.Enumerator> instance with the supplied options.
/// Remarks:
///  To create a basic enumerator, you supply a "moveNext" method, that returns a "done"
///  parameter when its execution is finished:
///  > var i = 0;
///  > Ken.Enumerator.basic({
///  >   reset: function() { var i = 0; },
///  >   moveNext: function(done) {
///  >     if(i < 1000) return ++i;
///  >     return done;
///  >   }
///  > });
///  Would return every value from 0 to 1000 and then stop. Never returning "done" will cause
///  an infinite enumeration, such as by supplying:
///  >  moveNext: function() { return ++i; }
///  would make the method iterate values as long as they are requested.
Ken.Enumerator.basic  = function(opts) { return new Ken.Enumerator(Ken.Enumerator.basicConfig(opts)); };

/// Static Method: func
///  Creates a new enumeration over a function, returning its values while it returns values.
/// Parameters:
///  fn - The method to iterate over.
/// Returns:
///  A <Ken.Enumerator> instance which will invoke the supplied method when iterated.
Ken.Enumerator.func   = function(fn)   { return new Ken.Enumerator(Ken.Enumerator.funcConfig(fn));    };

/// Static Method: object
///  Creates a new enumeration over an objects properties.
/// Parameters:
///  obj - An object to iterate properties from.
/// Returns:
///  A <Ken.Enumerator> instance which will iterate over properties from the object.
Ken.Enumerator.object = function(obj)  { return new Ken.Enumerator(Ken.Enumerator.objectConfig(obj)); };

Ken.Enumerator.arrayConfig = function(arr)
{
  return {
    array:    arr,
    reset:    function() { this.i = -1; },
    current:  function() { return arr[this.i]; },
    moveNext: function() { this.i++; return arr.length > this.i; }
  };
};

Ken.Enumerator.basicConfig = function(opts)
{
  var current;
  var done = {};
  
  var _reset = opts.reset;
  var _moveNext = opts.moveNext;
  
  opts.current = function() { return current; };
  opts.reset = function() {
    current = undefined;
    if(_reset) _reset.call(this);
  };
  opts.moveNext = function() { 
    current = _moveNext.call(this, done);
    if(current === done)
    {
      current = undefined;
      return false;
    }
    return true;
  };
  
  return opts;
};

Ken.Enumerator.funcConfig = function(fn)
{
  return {
    reset:    function() { this._current = undefined; },
    current:  function() { return this._current; },
    moveNext: function() { return (this._current = fn()) !== undefined; }
  };
};

Ken.Enumerator.objectConfig = function(obj)
{
  return {
    reset: function() { this.i = -1; },
    first: function() {
      data = [];
      for(var key in obj) {
        if(obj.hasOwnProperty(key)) { data.push(key); }
      };
      this.data = data;
      this.i = -1;
    },
    moveNext: function(done) {
      this.i+=1;
      var data = this.data;
      if(data.length <= this.i) { return done; }
      return [data[this.i], obj[data[this.i]]];
    }
  };
};
