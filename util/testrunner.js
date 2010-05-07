var sys = require('sys');
var files = process.argv[2].split(" ");

var red   = function(str){return "\033[31m" + str + "\033[39m"};
var gray  = function(str){return "\033[30m" + str + "\033[39m"};
var green = function(str){return "\033[32m" + str + "\033[39m"};
var bold  = function(str){return "\033[1m"  + str + "\033[22m"};

var test = {
  moduleName: null,
  modules: { },
  
  that: function(name, method) {
    if(!test.modules[test.moduleName]) test.modules[test.moduleName] = [];
    test.modules[test.moduleName].push({ name: name, method: method });
  }
}

var allTestCount = 0;
var allTestSuccess = 0;

files.forEach(function(file) {
  try {
   test.moduleName = file;
   require('../' + file.replace(/\.js$/,"")).run(test);
  } catch(e) {
   sys.puts(red(bold("\nCould not load " + file)));
   sys.puts(gray(bold(e.stack))); 
  }
});

for(var key in test.modules) {
  if(!test.modules.hasOwnProperty(key)) continue;
  var tests = test.modules[key];
  
  var testCount = 0;
  var testSuccess = 0;
  
  sys.puts(bold("\nFile: " + key));
  tests.forEach(function(test) {
    testCount++;
    sys.print(test.name);
    try {
      test.method();
      sys.puts(green(" ✔"));
      testSuccess++;
    } catch(e) {
      sys.puts(red(" ✖"));
      sys.puts(gray(e.stack));
      return;
    }
  });
  
  allTestCount += testCount;
  allTestSuccess += testSuccess;
  if(testSuccess == testCount)
    sys.puts(green(testSuccess + " of " + testCount + " passed."));
  else
    sys.puts(bold(red(testSuccess + " of " + testCount + " passed.")));
};


sys.puts("\n\nTest complete")
if(allTestSuccess == allTestCount)
  sys.puts(green(allTestSuccess + " of " + allTestCount + " passed."));
else {
  sys.puts(bold(red(allTestSuccess + " of " + allTestCount + " passed.")));
  process.exit(1);
}