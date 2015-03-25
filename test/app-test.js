// :: this sets up an express server for development testing

'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);

// :: config
app.use(express.static('./test'));

// :: start HTTP server
var port = process.env.PORT || 9000;
server.listen(port, '127.0.0.1', function () {
  console.log('Express server listening on %d.', port);
});

exports = module.exports = app;