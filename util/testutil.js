this.sameEnum = function(a, b)
{
    a = enumerate(a);
    b = enumerate(b);
    same(a, b, ["expected [", a, "], got [", b, "]"].join(""));
}

function enumerate(a)
{
    if(!a.getEnumerator) return a;
    var enumr = a.getEnumerator();
    var arr = [];
    while(enumr.moveNext()) arr.push(enumr.current());
    return arr;
}
