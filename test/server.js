var app = require('express').createServer();

app.get(/^\/((doc)?test[.](coffee|js))?$/, function (req, res) {
  res.sendfile(__dirname + '/' + (req.route.params[0] || 'test.html'));
});

app.listen(3000);
