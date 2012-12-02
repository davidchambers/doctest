#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var doctest = require('./lib/doctest');

var file = path.resolve(process.argv[2]);
var buffer = fs.readFileSync(file);
doctest.generate_fetch_callback(file)(buffer.toString());
