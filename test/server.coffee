fs        = require 'fs'
path      = require 'path'

{compile} = require 'coffee-script'
express   = require 'express'
_         = require 'underscore'


app = express()

app.get '/', (req, res) ->
  res.sendfile __dirname + '/test.html'

mappings =
  escodegen:  'escodegen.browser.js'
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
