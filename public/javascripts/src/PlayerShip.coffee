class PlayerShip extends Entity
  constructor: (options) ->
    @settings = $.extend @settings, options
    @settings.type = 'ship'

    @tilemap =
      front: 0
      back: @settings.tile_size
      right: 2 * @settings.tile_size
      left: 3 * @settings.tile_size

    @direction = 'right'

    super @settings

  applyForceX: (force) ->
    # Add force until max speed
    newx = @settings.force_x + force
    @settings.force_x = newx unless Math.abs(newx) > @settings.max_speed_x

  applyForceY: (force) ->
    # Add force until max speed
    newy = @settings.force_y + force
    @settings.force_y = newy unless Math.abs(newy) > @settings.max_speed_y

  tick: ->
    # Get current position
    current_x = @element.position().left
    current_y = @element.position().top

    # Set new velocity_x, based on force and friction
    newx = 0
    newx = @settings.force_x / Math.abs(@settings.force_x) unless @settings.force_x == 0
    @settings.velocity_x += newx unless Math.abs(@settings.velocity_x + newx) > @settings.max_speed_x
    @settings.velocity_x -= @settings.velocity_x * @settings.friction
    # Set new velocity_y, based on force and friction
    newy = 0
    newy = @settings.force_y / Math.abs(@settings.force_y) unless @settings.force_y == 0
    @settings.velocity_y += newy unless Math.abs(@settings.velocity_y + newy) > @settings.max_speed_y
    @settings.velocity_y -= @settings.velocity_y * @settings.friction
    
    # Place entity
    @settings.x = (current_x = current_x + @settings.velocity_x)
    @settings.y = (current_y = current_y + @settings.velocity_y)
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
