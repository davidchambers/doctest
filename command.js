#!/usr/bin/node
var fs = require('fs');
var path = require('path');
var document = require("jsdom").jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
var doctest = require('doctest');

var file = process.argv[2];
var file = path.resolve(file);
var buffer = fs.readFileSync(file);
var text = buffer.toString();
var run = doctest.generate_fetch_callback(file);
run(text);
