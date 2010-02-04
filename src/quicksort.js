if(typeof Ken == "undefined") { Ken = { }; }

Ken.quickSort = function(array, keySelector, comparer, begin, end)
{
  if(array.toArray) array = array.toArray();
  if(!comparer) comparer = Ken.quickSort.defaultComparer;
  if(begin === undefined) begin = 0;
  if(end === undefined) end = array.length;
  
  if(end-1 > begin)
  {
    var pivot = begin + Math.floor((end - begin)/2);
    
    pivot=Ken.quickSort.partition(array, begin, end, pivot, comparer, keySelector);
    
    Ken.quickSort(array, keySelector, comparer, begin, pivot);
    Ken.quickSort(array, keySelector, comparer, pivot+1, end);
  }
  return array;
}

Ken.quickSort.defaultComparer = function(a, b) {
  return (a < b ? -1 : (a > b ? 1 : 0));
};

Ken.quickSort.partition = function(array, begin, end, pivot, comparer, keySelector)
{
  var piv = array[pivot];
  Ken.quickSort.swap(array, pivot, end-1);
  var store = begin;
  var ix;
  for(ix=begin; ix<end-1; ++ix) {
    var a = keySelector ? keySelector(array[ix]) : array[ix];
    var b = keySelector ? keySelector(piv) : piv;
    
    if(comparer(a, b, array[ix], piv) < 0) {
      Ken.quickSort.swap(array, store, ix);
      ++store;
    }
  }
  Ken.quickSort.swap(array, end-1, store);
  return store;
}

Ken.quickSort.swap = function(arr, a, b)
{
  var tmp=arr[a];
  arr[a]=arr[b];
  arr[b]=tmp;
}
