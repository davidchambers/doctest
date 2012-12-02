fs = require 'fs'
path = require 'path'

CoffeeScript = require 'coffee-script'
express = require 'express'


app = express()

app.get '/', (req, res) ->
  res.sendfile __dirname + '/test.html'

app.get '/test.js', (req, res) ->
  res.sendfile __dirname + req.route.path

app.get '/test.coffee', (req, res) ->
  res.sendfile __dirname + req.route.path

app.get '/doctest.js', (req, res) ->
  fs.readFile path.resolve('src', 'doctest.coffee'), 'utf8', (err, text) ->
    res.contentType 'js'
    res.send CoffeeScript.compile text

port = process.env.PORT ? 3000
app.listen port, -> console.log "listening on port #{port}"
