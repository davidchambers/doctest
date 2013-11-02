fs        = require 'fs'
https     = require 'https'
path      = require 'path'

{compile} = require 'coffee-script'
express   = require 'express'
_         = require 'underscore'


app = express()

app.get '/', (req, res) ->
  res.sendfile __dirname + '/test.html'

# escodegen@0.0.23 was the last version to include escodegen.browser.js
# in the npm package. In order to build this file ourselves we'd need to
# first install escodegen's devDependencies. It's simpler to request the
# appropriate version of the file from GitHub and stream the response.
app.get '/escodegen.browser.js', (req, res) ->
  version = require('../package.json').dependencies.escodegen
  url = "https://raw.github.com/Constellation/escodegen/#{version}#{req.url}"
  https.get url, (res_) ->
    res.writeHead res_.statusCode,
      'Content-Length': res_.headers['content-length']
      'Content-Type': 'application/json; charset=utf-8'
    res_.pipe res

mappings =
  esprima:    'esprima.js'
  underscore: 'underscore.js'

_.each mappings, (filename, name) ->
  app.get "/#{filename}", (req, res) ->
    res.sendfile path.join __dirname, '..', 'node_modules', name, filename

app.get '/test.js', (req, res) ->
  res.sendfile __dirname + req.route.path

app.get '/test.coffee', (req, res) ->
  res.sendfile __dirname + req.route.path

app.get '/doctest.js', (req, res) ->
  fs.readFile path.resolve('src', 'doctest.coffee'), 'utf8', (err, text) ->
    res.contentType 'js'
    res.send compile text

_.each ['browser', 'tests'], (name) ->
  app.get "/#{name}.js", (req, res) ->
    fs.readFile path.resolve('test', "#{name}.coffee"), 'utf8', (err, text) ->
      res.contentType 'js'
      res.send compile text

port = process.env.PORT ? 3000
app.listen port, -> console.log "listening on port #{port}"
