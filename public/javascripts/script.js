(function() {
  var Entity, Game, PlayerShip, Ship, Socket;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Entity = (function() {
    Entity.total = 0;
    function Entity(options) {
      this.settings = {
        id: Entity.total++,
        type: 'entity',
        x: 0,
        y: 0,
        velocity_x: 0,
        velocity_y: 0,
        acceleration_x: 1.5,
        acceleration_y: 1.5,
        force_x: 0,
        force_y: 0,
        max_speed_x: 10,
        max_speed_y: 10,
        friction: 0.1,
        tile_size: 32
      };
      this.settings = $.extend(this.settings, options);
      this.id = this.settings.id;
      this.tilemap = {
        front: 0,
        back: this.settings.tile_size,
        right: 2 * this.settings.tile_size,
        left: 3 * this.settings.tile_size
      };
      this.direction = 'right';
      this.element = $(document.createElement('div'));
      this.element.attr('id', "" + this.settings.type + this.settings.id);
      this.element.addClass('entity');
      this.element.addClass(this.settings.type);
      this.element.css('left', "" + this.settings.x + "px");
      this.element.css('top', "" + this.settings.y + "px");
    }
    Entity.prototype.tick = function() {
      this.element.css('left', this.settings.x + 'px');
      this.element.css('top', this.settings.y + 'px');
      if (Math.abs(this.settings.velocity_y) > Math.abs(this.settings.velocity_x)) {
        if (this.settings.velocity_y < 0) {
          this.element.css('background-position', "-" + this.tilemap.back + "px 0");
          return this.direction = 'up';
        } else {
          this.element.css('background-position', "-" + this.tilemap.front + "px 0");
          return this.direction = 'down';
        }
      } else {
        if (this.settings.velocity_x < 0) {
          this.element.css('background-position', "-" + this.tilemap.right + "px 0");
          return this.direction = 'left';
        } else {
          this.element.css('background-position', "-" + this.tilemap.left + "px 0");
          return this.direction = 'right';
        }
      }
    };
    return Entity;
  })();
  Game = (function() {
    function Game(options) {
      var _this;
      this.settings = {
        water_element: $('#water'),
        tick_time: 100,
        x_speed: 1,
        y_speed: 1,
        socket: null
      };
      this.settings = $.extend(this.settings, options);
      _this = this;
      this.player = null;
      this.entities = {};
      this.entity_ids = [];
      this.ticker = setInterval((function() {
        return _this.tick();
      }), this.settings.tick_time);
      window.addEventListener('keydown', (function(e) {
        return _this.onKeyDown(e);
      }), false);
      window.addEventListener('keyup', (function(e) {
        return _this.onKeyUp(e);
      }), true);
    }
    Game.prototype.addPlayer = function(player) {
      this.player = player;
      return this.player.element.appendTo(this.settings.water_element);
    };
    Game.prototype.addEntity = function(entity) {
      this.entities[entity.id] = entity;
      this.entity_ids.push(entity.id);
      return entity.element.appendTo(this.settings.water_element);
    };
    Game.prototype.updateEntity = function(settings) {
      return this.entities[settings.id].settings = settings;
    };
    Game.prototype.removeEntity = function(data) {
      $('#ship' + data.client_id).remove();
      this.entity_ids.remove(data.client_id);
      return delete this.entities[data.client_id];
    };
    Game.prototype.onKeyDown = function(e) {
      switch (e.keyCode) {
        case 37:
          return this.player.applyForceX(-this.settings.x_speed);
        case 38:
          return this.player.applyForceY(-this.settings.y_speed);
        case 39:
          return this.player.applyForceX(this.settings.x_speed);
        case 40:
          return this.player.applyForceY(this.settings.y_speed);
        default:
          break;
      }
    };
    Game.prototype.onKeyUp = function(e) {
      switch (e.keyCode) {
        case 37:
          return this.player.settings.force_x = 0;
        case 38:
          return this.player.settings.force_y = 0;
        case 39:
          return this.player.settings.force_x = 0;
        case 40:
          return this.player.settings.force_y = 0;
        default:
          break;
      }
    };
    Game.prototype.tick = function() {
      var id, prev_player_x, prev_player_y, _i, _len, _ref, _results;
      prev_player_x = Math.round(this.player.settings.x);
      prev_player_y = Math.round(this.player.settings.y);
      this.player.tick();
      if (prev_player_x !== Math.round(this.player.settings.x) || prev_player_y !== Math.round(this.player.settings.y)) {
        this.settings.socket.updatePosition(this.player.settings);
      }
      _ref = this.entity_ids;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        _results.push(this.entities[id].tick());
      }
      return _results;
    };
    return Game;
  })();
  PlayerShip = (function() {
    __extends(PlayerShip, Entity);
    function PlayerShip(options) {
      this.settings = $.extend(this.settings, options);
      this.settings.type = 'ship';
      this.tilemap = {
        front: 0,
        back: this.settings.tile_size,
        right: 2 * this.settings.tile_size,
        left: 3 * this.settings.tile_size
      };
      this.direction = 'right';
      PlayerShip.__super__.constructor.call(this, this.settings);
    }
    PlayerShip.prototype.applyForceX = function(force) {
      var newx;
      newx = this.settings.force_x + force;
      if (!(Math.abs(newx) > this.settings.max_speed_x)) {
        return this.settings.force_x = newx;
      }
    };
    PlayerShip.prototype.applyForceY = function(force) {
      var newy;
      newy = this.settings.force_y + force;
      if (!(Math.abs(newy) > this.settings.max_speed_y)) {
        return this.settings.force_y = newy;
      }
    };
    PlayerShip.prototype.tick = function() {
      var current_x, current_y, newx, newy;
      current_x = this.element.position().left;
      current_y = this.element.position().top;
      newx = 0;
      if (this.settings.force_x !== 0) {
        newx = this.settings.force_x / Math.abs(this.settings.force_x);
      }
      if (!(Math.abs(this.settings.velocity_x + newx) > this.settings.max_speed_x)) {
        this.settings.velocity_x += newx;
      }
      this.settings.velocity_x -= this.settings.velocity_x * this.settings.friction;
      newy = 0;
      if (this.settings.force_y !== 0) {
        newy = this.settings.force_y / Math.abs(this.settings.force_y);
      }
      if (!(Math.abs(this.settings.velocity_y + newy) > this.settings.max_speed_y)) {
        this.settings.velocity_y += newy;
      }
      this.settings.velocity_y -= this.settings.velocity_y * this.settings.friction;
      this.settings.x = (current_x = current_x + this.settings.velocity_x);
      this.settings.y = (current_y = current_y + this.settings.velocity_y);
      this.element.css('left', this.settings.x + 'px');
      this.element.css('top', this.settings.y + 'px');
      if (Math.abs(this.settings.velocity_y) > Math.abs(this.settings.velocity_x)) {
        if (this.settings.velocity_y < 0) {
          this.element.css('background-position', "-" + this.tilemap.back + "px 0");
          return this.direction = 'up';
        } else {
          this.element.css('background-position', "-" + this.tilemap.front + "px 0");
          return this.direction = 'down';
        }
      } else {
        if (this.settings.velocity_x < 0) {
          this.element.css('background-position', "-" + this.tilemap.right + "px 0");
          return this.direction = 'left';
        } else {
          this.element.css('background-position', "-" + this.tilemap.left + "px 0");
          return this.direction = 'right';
        }
      }
    };
    return PlayerShip;
  })();
  Ship = (function() {
    __extends(Ship, Entity);
    function Ship(options) {
      this.settings = $.extend(this.settings, options);
      this.settings.type = 'ship';
      Ship.__super__.constructor.call(this, this.settings);
    }
    Ship.prototype.tick = function() {
      return Ship.__super__.tick.call(this);
    };
    return Ship;
  })();
  Socket = (function() {
    function Socket(options) {
      var _this;
      this.settings = {
        id: null,
        host: 'http://localhost',
        launch: function() {},
        clientConnected: function() {},
        clientDisconnected: function() {},
        updateClient: function() {},
        username: null
      };
      this.settings = $.extend(this.settings, options);
      this.connected = false;
      _this = this;
      this.socket = io.connect(this.settings.host);
      this.socket.on('connected', function(data) {
        alert('connected');
        _this.id = this.socket.sessionid;
        return _this.socket.emit('join game', {});
      });
      this.socket.on('client connected', function(data) {
        return _this.settings.clientConnected(data);
      });
      this.socket.on('client disconnected', function(data) {
        return _this.settings.clientDisconnected(data);
      });
      this.socket.on('joined', function(data) {
        if (!_this.connected) {
          _this.settings.launch(data);
        }
        return _this.connected = true;
      });
      this.socket.on('client updated', function(data) {
        return _this.settings.updateClient(data);
      });
    }
    Socket.prototype.updatePosition = function(data) {
      return this.socket.emit('update position', data);
    };
    return Socket;
  })();
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
  $(document).ready(function() {
    var launch, removeClient, updateClient, _game, _host, _player, _socket;
    _host = $('#host').text();
    _game = null;
    _player = null;
    launch = function(data) {
      $('#connecting').fadeOut();
      _game = new Game({
        socket: _socket
      });
      _player = new PlayerShip({
        id: _socket.id,
        x: $(window).width() / 2 - 16,
        y: $(window).height() / 2 - 16
      });
      return _game.addPlayer(_player);
    };
    updateClient = function(data) {
      var $client, client;
      $client = $('#ship' + data.id);
      if ($client.length < 1) {
        client = new Ship({
          id: data.id,
          x: data.x,
          y: data.y
        });
        return _game.addEntity(client);
      } else {
        return _game.updateEntity(data);
      }
    };
    removeClient = function(data) {
      return _game.removeEntity(data);
    };
    return _socket = new Socket({
      host: _host,
      launch: launch,
      updateClient: updateClient,
      clientDisconnected: removeClient
    });
  });
}).call(this);
