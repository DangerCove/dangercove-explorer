class Game
  constructor: (options) ->
    @settings =
      water_element: $('#water')
      tick_time: 100
      x_speed: 1
      y_speed: 1
      socket: null
    @settings = $.extend @settings, options

    _this = @
    
    @player = null
    @entities = {}
    @entity_ids = []

    @ticker = setInterval (-> _this.tick()), @settings.tick_time

    window.addEventListener 'keydown', ((e) -> _this.onKeyDown(e)), false
    window.addEventListener 'keyup', ((e) -> _this.onKeyUp(e)), true

  addPlayer: (player) ->
    @player = player
    @player.element.appendTo @settings.water_element

  addEntity: (entity) ->
    @entities[entity.id] = entity
    @entity_ids.push entity.id
    entity.element.appendTo @settings.water_element

  updateEntity: (settings) ->
    @entities[settings.id].settings = settings

  removeEntity: (data) ->
    $('#ship' + data.client_id).remove()
    @entity_ids.remove(data.client_id)
    delete @entities[data.client_id]

  onKeyDown: (e) ->
    switch e.keyCode
      # Left Arrow
      when 37 then @player.applyForceX -(@settings.x_speed) #@player.settings.velocity_x = -(@settings.x_speed)
      # Up Arrow
      when 38 then @player.applyForceY -(@settings.y_speed) #@player.settings.velocity_y = -(@settings.y_speed)
      # Right Arrow
      when 39 then @player.applyForceX @settings.x_speed #@player.settings.velocity_x = (@settings.x_speed)
      # Down Arrow
      when 40 then @player.applyForceY @settings.y_speed #@player.settings.velocity_y = (@settings.y_speed)
      else break
    
  onKeyUp: (e) ->
    switch e.keyCode
      # Left Arrow
      when 37 then @player.settings.force_x = 0
      # Up Arrow
      when 38 then @player.settings.force_y = 0
      # Right Arrow
      when 39 then @player.settings.force_x = 0
      # Down Arrow
      when 40 then @player.settings.force_y = 0
      else break

  tick: ->
    # console.log 'tick game'
    prev_player_x = Math.round(@player.settings.x)
    prev_player_y = Math.round(@player.settings.y)
    @player.tick()
    if prev_player_x != Math.round(@player.settings.x) or prev_player_y != Math.round(@player.settings.y)
      @settings.socket.updatePosition(@player.settings)

    for id in @entity_ids
      @entities[id].tick()
