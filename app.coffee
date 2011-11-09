# Ship Fight game by Boy & Bjørn from Danger Cove
Array::shuffle = -> @sort -> 0.5 - Math.random()
Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1

express = require 'express'
routes = require './routes'

app = module.exports = express.createServer()
io = require('socket.io').listen(app)

# Configuration
io.configure ->
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
  
app.configure ->
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))

app.configure 'development', ->
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  app.settings.hostname = 'http://localhost'
  app.settings.port = 3000
  app.listen(app.settings.port)

app.configure 'production', ->
  app.use(express.errorHandler())
  app.settings.hostname = 'http://shipfight.herokuapp.com'
  app.settings.port = process.env.PORT || 3000
  console.log "======= PORT: #{app.settings.port}"
  app.listen(app.settings.port)

# Routes

app.get('/', routes.index)

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)

# socket.io
_clients = {}
_client_ids = []

io.sockets.on 'connection', (socket) ->

  _id = socket.id

  # Send settings back when connecting
  socket.emit('connected', { id: _id })

  # On client connect
  socket.on 'join game', (data) ->
    _clients[_id] = data
    _client_ids.push _id

    socket.emit 'joined', { clients: _clients, client_ids: _client_ids }
    socket.broadcast.emit 'client connected', {}

  socket.on 'update position', (data) ->
    _clients[data.id] = data
    socket.broadcast.emit 'client updated', data

  # On client disconnect
  socket.on 'disconnect', ->
    _client_ids.remove(_id)
    delete _clients[_id]

    socket.broadcast.emit('client disconnected', { client_id: _id, clients: _clients, client_ids: _client_ids })

