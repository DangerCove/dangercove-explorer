(function() {
  var app, express, io, routes, _client_ids, _clients;
  Array.prototype.shuffle = function() {
    return this.sort(function() {
      return 0.5 - Math.random();
    });
  };
  Array.prototype.remove = function(e) {
    var t, _ref;
    if ((t = this.indexOf(e)) > -1) {
      return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
    }
  };
  express = require('express');
  routes = require('./routes');
  app = module.exports = express.createServer();
  io = require('socket.io').listen(app);
  io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    return io.set("polling duration", 10);
  });
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express.static(__dirname + '/public'));
  });
  app.configure('development', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    app.settings.hostname = 'http://localhost';
    app.settings.port = 3000;
    return app.listen(app.settings.port);
  });
  app.configure('production', function() {
    app.use(express.errorHandler());
    app.settings.hostname = 'http://exploration.herokuapp.com';
    app.settings.port = process.env.PORT || 3000;
    return app.listen(app.settings.port);
  });
  app.get('/', routes.index);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
  _clients = {};
  _client_ids = [];
  io.sockets.on('connection', function(socket) {
    var _id;
    _id = socket.id;
    socket.emit('connected', {
      id: _id
    });
    socket.on('join game', function(data) {
      _clients[_id] = data;
      _client_ids.push(_id);
      socket.emit('joined', {
        clients: _clients,
        client_ids: _client_ids
      });
      return socket.broadcast.emit('client connected', {});
    });
    socket.on('update position', function(data) {
      _clients[data.id] = data;
      return socket.broadcast.emit('client updated', data);
    });
    return socket.on('disconnect', function() {
      _client_ids.remove(_id);
      delete _clients[_id];
      return socket.broadcast.emit('client disconnected', {
        client_id: _id,
        clients: _clients,
        client_ids: _client_ids
      });
    });
  });
}).call(this);
