var express = require('express');

var app = express();
app.get(/^\/((doc)?test[.](coffee|js))?$/, function (req, res) {
  res.sendfile(__dirname + '/' + (req.route.params[0] || 'test.html'));
});

app.listen(3000);
