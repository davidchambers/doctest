var express = require('express');

var app = express();
app.get(/^\/((doc)?test[.](coffee|js))?$/, function (req, res) {
  res.sendfile(__dirname + '/' + (req.route.params[0] || 'test.html'));
});

var port = process.env.PORT;
if (port == null) port = 3000;
app.listen(port, console.log.bind(null, 'listening on port ' + port));
