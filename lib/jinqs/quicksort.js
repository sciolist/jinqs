/* Copyright (c) 2010 the authors listed at the following URL, and/or
the authors of referenced articles or incorporated external code:
http://en.literateprograms.org/Quicksort_(JavaScript)?action=history&offset=20070102180347

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Retrieved from: http://en.literateprograms.org/Quicksort_(JavaScript)?oldid=8410
*/

if(typeof jinqs == "undefined") { jinqs = { }; }
if(typeof exports != "undefined") exports.jinqs = jinqs;

jinqs.quickSort = function(array, keySelector, comparer, begin, end) {
  if(array.toArray) array = array.toArray();
  if(!comparer) comparer = jinqs.quickSort.defaultComparer;
  if(begin === undefined) begin = 0;
  if(end === undefined) end = array.length;
  
  if(end-1 > begin) {
    var pivot = begin + Math.floor((end - begin)/2);
    pivot = jinqs.quickSort.partition(array, begin, end, pivot, comparer, keySelector);
    
    jinqs.quickSort(array, keySelector, comparer, begin, pivot);
    jinqs.quickSort(array, keySelector, comparer, pivot+1, end);
  }
  return array;
}

jinqs.quickSort.defaultComparer = function(a, b) {
  return (a < b ? -1 : (a > b ? 1 : 0));
};

jinqs.quickSort.partition = function(array, begin, end, pivot, comparer, keySelector) {
  var piv = array[pivot];
  jinqs.quickSort.swap(array, pivot, end-1);
  var store = begin;
  var ix;
  for(ix=begin; ix<end-1; ++ix) {
    var a = keySelector ? keySelector(array[ix]) : array[ix];
    var b = keySelector ? keySelector(piv) : piv;
    
    if(comparer(a, b, array[ix], piv) < 0) {
      jinqs.quickSort.swap(array, store, ix);
      ++store;
    }
  }
  jinqs.quickSort.swap(array, end-1, store);
  return store;
}

jinqs.quickSort.swap = function(arr, a, b) {
  var tmp=arr[a];
  arr[a]=arr[b];
  arr[b]=tmp;
}
