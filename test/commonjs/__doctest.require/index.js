'use strict';

const url = typeof __doctest === 'undefined' ? {} : __doctest.require ('url');

// > (new url.URL ('https://sanctuary.js.org/')).hostname
// 'sanctuary.js.org'

url;
