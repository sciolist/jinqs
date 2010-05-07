require 'fileutils'
require 'rake/clean'
sources = ["src/enumerator.js", "src/quicksort.js", "src/jinqs.js"]
version = File.read("VERSION").strip
CLEAN.include('out')
directory "out"

file "out/jinqs-#{version}.min.js" => ["out"] + sources do |t|
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

task :build => ["out/jinqs-#{version}.min.js"] do
  cp_r 'Readme.md', 'out/Readme.md'
  cp_r 'LICENSE', 'out/LICENSE'
end
task :default => :build
