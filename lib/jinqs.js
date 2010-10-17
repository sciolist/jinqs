if(typeof jinqs == "undefined") { jinqs = { }; }
if(typeof exports != "undefined") {
  var merge = function(target, src) {
    for(var key in src) {
      if(!src.hasOwnProperty(key)) continue;
      target[key] = src[key];
    };
  }
  if(!jinqs.Enumerator) merge(jinqs, require("./jinqs/enumerator").jinqs);
  if(!jinqs.quickSort) merge(jinqs, require("./jinqs/quicksort").jinqs);
  if(!jinqs.over) merge(jinqs, require("./jinqs/jinqs").jinqs);
  merge(exports, jinqs);
}