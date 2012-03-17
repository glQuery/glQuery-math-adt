fs     = require 'fs'
path   = require 'path'
{exec} = require 'child_process'

libFiles  = [
  # omit src/ and .js to make the below lines a little shorter
  'closure.header'
  'core'
  'adt'
  'math.ord.adt'
  'closure.footer'
]

###
Build helpers (sequenced, composible)
###

# Filename -> (Maybe (() -> IO) -> () -> IO) -> Maybe (() -> IO) -> () -> IO
ifExists = (filename) -> (condCallback) -> (callback) -> -> 
  path.exists filename, (exists) ->
    if exists
      (condCallback callback)()
    else
      callback() if callback?
              
# [Filename] -> (String -> () -> IO) -> () -> IO
concatFiles = (files) -> (callback) -> 
  contents = new Array files.length
  remaining = files.length
  ->
    for file, index in files then do (file, index) ->
      fs.readFile "#{file}", 'utf8', (err, fileContents) ->
        throw err if err
        contents[index] = fileContents
        (callback contents)() if --remaining is 0 and callback?

# [Filename] -> (String -> () -> IO) -> () -> IO
concatSrcFiles = (files) -> 
  concatFiles ("src/#{file}.js" for file in files)

# Filename -> Maybe (() -> IO) -> String -> () -> IO
writeFile = (filename) -> (callback) -> (text) -> ->
  fs.writeFile "#{filename}", text.join(''), 'utf8', (err) ->
    throw err if err
    callback() if callback?

# String -> Maybe (() -> IO) -> () -> IO 
logDone = (message) -> (callback) -> -> 
  console.log "...Done (#{message})"
  callback() if callback?

###
Build scripts
###

# Maybe (() -> IO) -> () -> IO
build = (callback) -> (concatSrcFiles libFiles) (writeFile 'build/glquery.math.js') callback

# Maybe (() -> IO) -> () -> IO
minify = (callback) -> ->
  path.exists 'node_modules/.bin/uglifyjs', (exists) ->
    tool = if exists then 'node_modules/.bin/uglifyjs' else 'uglifyjs'
    path.exists 'build/glquery.math.js', (exists) ->
      if exists
        exec "#{tool} --no-copyright build/glquery.math.js > build/glquery.math.min.js", (err, stdout, stderr) ->
          throw err if err
          console.log stdout + stderr
          callback() if callback?

# Maybe (() -> IO) -> () -> IO
wrap = (callback) ->
    filenameMath = 'glquery.math.js'
    filenameMin = 'glquery.math.min.js'

    # TODO: Unfortunately it is not so easy to wrap `(callback) -> f0 f1 f2 callback` in JavaScript
    #       In order to get something similar to point-free style (http://www.haskell.org/haskellwiki/Pointfree)
    #       we could do something like `(f0.compose f1).compose f2`
    #       or alternatively `(compose (compose f0) f1) f2` or `(f0.compose() f1).compose() f2`
    
    # Maybe (() -> IO) -> () -> IO
    writeMath = (callback) -> (concatFiles ['src/header.js', "build/#{filenameMath}"]) (writeFile "dist/#{filenameMath}") callback
    writeMin = (callback) -> (concatFiles ['src/header.js', "build/#{filenameMin}"]) (writeFile "dist/#{filenameMin}") callback
    writeModuleMath = (callback) -> (concatFiles ['src/header.js', 'src/module.header.js', "build/#{filenameMath}", 'src/module.footer.js']) (writeFile 'dist/glquery.math.module.js') callback
    writeModuleMin = (callback) -> (concatFiles ['src/header.js', 'src/module.header.js', "build/#{filenameMin}", 'src/module.footer.js']) (writeFile 'dist/glquery.math.module.min.js') callback

    # Maybe (() -> IO) -> () -> IO
    wrapMath = (callback) -> writeMath (logDone 'glquery.math.js') callback
    wrapMin = (callback) -> writeMin (logDone 'glquery.math.min.js') callback
    wrapModuleMath = (callback) -> writeModuleMath (logDone 'glquery.math.module.js') callback
    wrapModuleMin = (callback) -> writeModuleMin (logDone 'glquery.math.module.min.js') callback
    
    # Maybe (() -> IO) -> () -> IO
    buildMath = (ifExists "build/#{filenameMath}") ((callback) -> wrapMath wrapModuleMath callback)
    buildMin = (ifExists "build/#{filenameMin}") ((callback) -> wrapMin wrapModuleMin callback)

    buildMath buildMin callback

###
Tasks
###

task 'all', "Build all distribution files", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  (build (logDone 'build') minify (logDone 'minify') wrap())()

task 'build', "Concatenate source files into a single library file", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  (build (logDone 'build') wrap())()
  console.log "ok...."

task 'fetch:npm', "Fetch the npm package manager", ->
  exec "curl http://npmjs.org/install.sh | sudo sh", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done"
    invokeNext()

task 'fetch:uglifyjs', "Fetch the UglifyJS minification tool", ->
  exec "npm install uglify-js", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "...Done"
    invokeNext()

task 'minify', "Minify the resulting application file after build", ->
  exec "mkdir -p 'build'", (err, stdout, stderr) ->
  (minify wrap())()

task 'clean', "Cleanup all build files and distribution files", ->
  exec "rm -rf build;rm dist/glquery.math.js;rm dist/glquery.math.min.js;rm dist/glquery.math.module.js;rm dist/glquery.math.module.min.js", (err, stdout, stderr) ->
    console.log stdout + stderr
    console.log "...Done (clean)"

