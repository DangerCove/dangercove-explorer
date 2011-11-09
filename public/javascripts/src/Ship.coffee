class Ship extends Entity
  constructor: (options) ->
    @settings = $.extend @settings, options
    @settings.type = 'ship'

    super @settings

  tick: ->
    super()
    # console.log 'tick ship'
