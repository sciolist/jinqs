if(typeof exports != "undefined") {
  var merge = function(target, src) {
    for(var key in src) {
      if(!src.hasOwnProperty(key)) continue;
      target[key] = src[key];
    }
  }
  merge(exports, require("./jinqs/enumerator").jinqs);
  merge(exports, require("./jinqs/quicksort").jinqs);
  merge(exports, require("./jinqs/jinqs").jinqs);
}