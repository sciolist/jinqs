load("./qunit.js").call(this);
var all_ok = true;
var _file;
var _module;
var _test;
var _fails = 0;
var _tests = 0;
var _totalTests = 0;
var _trace = null;

QUnit.log = function(result, msg) {
    var status = result ? "OK  " : "FAIL";
    if(!result) all_ok = false;
    print(status, (_module + "." + _test + ": " + msg).substr(0, 74));
    if(_trace) {
        print("STACK TRACE:\n", _trace, "\n");
        _trace = null;
    }
}
QUnit.done = function(failures, total) { }
QUnit.moduleStart = function(name, env) { _module = name; }
QUnit.testStart = function(name) { _test = name; _tests++; _totalTests++; _trace = null; }
QUnit.testDone  = function(name, failures, total) { _test = null; if(failures) _fails++;  }

this.console = {
    error: function(x) {
        if(typeof(x)=="string") return;
        if(x.rhinoException && x.rhinoException.printStackTrace)
            return _trace = x.rhinoException.message;
        _trace = x.toString()
    },
    warn: function(cb) { }
};





function showModuleResult()
{
    print((_tests - _fails), "of", _tests, "tests passed in", _module);
    _module = "";
    _test = "";
    _fails = 0;
    _tests = 0;
}

this.depend = function(file) {
    load("../" + file).call(this);
}

load("./testutil.js").call(this);
var files = system.args[1].split(" ");
for(var i=0; i < files.length; ++i)
{
    _file = files[i];
    print("\nRunning tests in", _file);
    load("../" + _file).call(this);
    showModuleResult();
}

print("");
if(!all_ok) throw "Failing tests were found.";
else print("all", _totalTests, "tests passed.");
