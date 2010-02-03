require 'fileutils'
sources = ["src/enumerator.js", "src/quicksort.js", "src/jinqs.js"]
version = File.read("VERSION")

task :default => ["bin/jinqs.#{version}.min.js"]

directory "bin"

file "bin/jinqs.#{version}.min.js" => ["bin"] + sources do |t|
  puts "making #{t}"	
  require 'util/jsmin'
  File.open t.to_s, "w" do |f|
    f.write JSMin.minify(sources)
  end
end

task :clean do |t|
end

task :clobber do |t|
  FileUtils.remove_dir "bin"
end

task :test => sources do |t|
  sh "narwhal", "util/runner.js", Dir["tests/**/test.*.js"].join(" ")
end
