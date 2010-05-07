require 'fileutils'
require 'rake/clean'
sources = ["src/enumerator.js", "src/quicksort.js", "src/jinqs.js"]
version = File.read("VERSION").strip
CLEAN.include('bin')

task :default => ["bin/jinqs-#{version}.min.js"]

directory "bin"

file "bin/jinqs-#{version}.min.js" => ["bin"] + sources do |t|
  puts "making #{t}"	
  require 'util/jsmin'
  File.open t.to_s, "w" do |f|
    f.write "/*#{File.read("LICENSE")}*/\n"
    f.write JSMin.minify(sources)
  end
end

task :test => sources do |t|
  sh "node", "util/testrunner.js", Dir["tests/**/test.*.js"].join(" ")
end
