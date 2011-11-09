Array::shuffle = -> @sort -> 0.5 - Math.random()
Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1

$(document).ready ->
  
  _host = $('#host').text()
  _game = null
  _player = null

  launch = (data) ->

    $('#connecting').fadeOut()

    _game = new Game({ socket: _socket })
    _player = new PlayerShip({ id: _socket.id, x: $(window).width()/2 - 16, y: $(window).height()/2 - 16 })
    _game.addPlayer _player

  updateClient = (data) ->
    $client = $('#ship' + data.id)
    # console.log data

    if $client.length < 1
      client = new Ship({ id: data.id, x: data.x, y: data.y })
      _game.addEntity client
    else
      _game.updateEntity data

  removeClient = (data) ->
      _game.removeEntity data

  _socket = new Socket { host: _host, launch: launch, updateClient: updateClient, clientDisconnected: removeClient }
 
