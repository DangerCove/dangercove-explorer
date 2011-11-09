class Entity
  @total: 0
  constructor: (options) ->
    @settings =
      id: Entity.total++
      type: 'entity'
      x: 0
      y: 0
      velocity_x: 0
      velocity_y: 0
      acceleration_x: 1.5
      acceleration_y: 1.5
      force_x: 0
      force_y: 0
      max_speed_x: 10
      max_speed_y: 10
      friction: 0.1
      tile_size: 32
    @settings = $.extend @settings, options

    @id = @settings.id

    @tilemap =
      front: 0
      back: @settings.tile_size
      right: 2 * @settings.tile_size
      left: 3 * @settings.tile_size

    @direction = 'right'

    @element = $(document.createElement('div'))
    @element.attr 'id', "#{@settings.type}#{@settings.id}"
    @element.addClass 'entity'
    @element.addClass @settings.type
    @element.css 'left', "#{@settings.x}px"
    @element.css 'top', "#{@settings.y}px"

  tick: ->
    @element.css 'left', (@settings.x + 'px')
    @element.css 'top', (@settings.y + 'px')

    # Set correct image
    # We're primarily moving vertically
    if Math.abs(@settings.velocity_y) > Math.abs(@settings.velocity_x)
      # We're moving up
      if @settings.velocity_y < 0
        @element.css 'background-position', "-#{@tilemap.back}px 0"
        @direction = 'up'
      # We're moving down
      else
        @element.css 'background-position', "-#{@tilemap.front}px 0"
        @direction = 'down'

    # We're primarily moving horizontally
    else
      # We're moving left
      if @settings.velocity_x < 0
        @element.css 'background-position', "-#{@tilemap.right}px 0"
        @direction = 'left'
      # We're moving right
      else
        @element.css 'background-position', "-#{@tilemap.left}px 0"
        @direction = 'right'
