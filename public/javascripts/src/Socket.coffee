class Socket
  constructor: (options) ->
    @settings =
      id: null
      host: 'http://localhost'
      launch: ->
      clientConnected: ->
      clientDisconnected: ->
      updateClient: ->
      username: null
    @settings = $.extend @settings, options

    @connected = false
    _this = @

    # Connect
    @socket = io.connect @settings.host
    alert @settings.host

    # On connected
    @socket.on 'connected', (data) ->
      
      _this.id = @.socket.sessionid

      # Join game
      _this.socket.emit 'join game', {}

    # Client joined
    @socket.on 'client connected', (data) ->
      # console.log 'client connected'
      # console.log data

      _this.settings.clientConnected data

    # Client left
    @socket.on 'client disconnected', (data) ->
      # console.log 'client disconnected'
      # console.log data

      _this.settings.clientDisconnected data

    # Game has been joined, start game
    @socket.on 'joined', (data) ->
      # console.log 'joined'
      # console.log data
      
      _this.settings.launch data if !_this.connected
      _this.connected = true

    # Client has updated it's position
    @socket.on 'client updated', (data) ->
      # console.log 'client updated'
      # console.log data
      
      _this.settings.updateClient data

  updatePosition: (data) ->

    @socket.emit 'update position', data
