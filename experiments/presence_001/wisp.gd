extends Node2D

@export var starting_speed: float = 215.0
@export var maximum_speed: float = 430.0
@export var momentum_gain: float = 48.0
@export var acceleration: float = 760.0
@export var deceleration: float = 680.0
@export var core_radius: float = 4.0
@export var glow_radius: float = 52.0
@export var pulse_speed: float = 1.2
@export var pulse_amount: float = 0.045
@export var drift_radius: float = 1.0
@export var drift_speed: float = 0.82
@export var particle_spawn_interval: float = 0.026

var _base_position: Vector2
var _velocity: Vector2 = Vector2.ZERO
var _travel_speed: float
var _time: float = 0.0
var _particle_timer: float = 0.0
var _trail_particles: Array[Dictionary] = []
var _ambient_motes: Array[Dictionary] = []
var _glow_texture: ImageTexture


func _ready() -> void:
	randomize()
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_base_position = position
	_travel_speed = starting_speed
	_glow_texture = _create_glow_texture(192)
	_build_ambient_motes()
	queue_redraw()


func _process(delta: float) -> void:
	_time += delta

	var input_vector := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if input_vector.length() > 0.0:
		_travel_speed = minf(_travel_speed + momentum_gain * delta, maximum_speed)

	var target_velocity := input_vector * _travel_speed
	var rate := acceleration if input_vector.length() > 0.0 else deceleration
	_velocity = _velocity.move_toward(target_velocity, rate * delta)

	_base_position += _velocity * delta
	var hit_edge := _clamp_to_viewport()
	if hit_edge:
		_travel_speed = starting_speed

	_particle_timer += delta
	while _particle_timer >= particle_spawn_interval:
		_particle_timer -= particle_spawn_interval
		_spawn_trail_particle(input_vector)

	_update_particles(delta)

	var drift := Vector2(
		cos(_time * drift_speed),
		sin(_time * drift_speed * 0.83)
	) * drift_radius

	position = _base_position + drift
	queue_redraw()


func place_at(new_position: Vector2) -> void:
	_base_position = new_position
	position = new_position
	_velocity = Vector2.ZERO
	_travel_speed = starting_speed
	queue_redraw()


func _create_glow_texture(size: int) -> ImageTexture:
	var image := Image.create(size, size, false, Image.FORMAT_RGBA8)
	var center := Vector2(size * 0.5, size * 0.5)
	var max_distance := size * 0.5

	for y in range(size):
		for x in range(size):
			var distance := Vector2(float(x), float(y)).distance_to(center) / max_distance
			var alpha := exp(-pow(distance * 2.35, 2.0))
			alpha *= smoothstep(1.0, 0.72, distance)
			image.set_pixel(x, y, Color(1.0, 1.0, 1.0, alpha))

	return ImageTexture.create_from_image(image)


func _build_ambient_motes() -> void:
	_ambient_motes.clear()

	for i in range(3):
		_ambient_motes.append({
			"orbit_radius": randf_range(core_radius * 2.5, glow_radius * 0.42),
			"angle": randf() * TAU,
			"speed": randf_range(0.14, 0.34),
			"size": randf_range(0.7, 1.3),
			"alpha": randf_range(0.035, 0.08)
		})


func _spawn_trail_particle(input_vector: Vector2) -> void:
	if _velocity.length() < 20.0:
		return

	var direction := _velocity.normalized()
	if direction == Vector2.ZERO and input_vector != Vector2.ZERO:
		direction = input_vector.normalized()

	var spawn_center := global_position - direction * randf_range(4.0, 10.0)
	spawn_center += Vector2.RIGHT.rotated(randf() * TAU) * randf_range(0.0, 2.4)

	var launch := Vector2.RIGHT.rotated(randf() * TAU) * randf_range(1.0, 4.0)
	launch += -direction * randf_range(8.0, 22.0)

	_trail_particles.append({
		"world_position": spawn_center,
		"velocity": launch,
		"radius": randf_range(0.75, 1.55),
		"age": 0.0,
		"lifetime": randf_range(0.48, 0.92),
		"alpha": randf_range(0.12, 0.26)
	})


func _update_particles(delta: float) -> void:
	for i in range(_trail_particles.size() - 1, -1, -1):
		var particle := _trail_particles[i]
		particle["age"] += delta
		particle["world_position"] += particle["velocity"] * delta
		particle["velocity"] = particle["velocity"].lerp(Vector2.ZERO, delta * 3.0)
		_trail_particles[i] = particle

		if particle["age"] >= particle["lifetime"]:
			_trail_particles.remove_at(i)


func _clamp_to_viewport() -> bool:
	var viewport_size := get_viewport_rect().size
	var margin := glow_radius * 0.7
	var hit_edge := false

	if _base_position.x < margin:
		_base_position.x = margin
		_velocity.x = 0.0
		hit_edge = true
	elif _base_position.x > viewport_size.x - margin:
		_base_position.x = viewport_size.x - margin
		_velocity.x = 0.0
		hit_edge = true

	if _base_position.y < margin:
		_base_position.y = margin
		_velocity.y = 0.0
		hit_edge = true
	elif _base_position.y > viewport_size.y - margin:
		_base_position.y = viewport_size.y - margin
		_velocity.y = 0.0
		hit_edge = true

	return hit_edge


func _draw_glow(center: Vector2, radius: float, color: Color) -> void:
	if _glow_texture == null:
		return

	var diameter := radius * 2.0
	var rect := Rect2(center - Vector2(radius, radius), Vector2(diameter, diameter))
	draw_texture_rect(_glow_texture, rect, false, color)


func _draw() -> void:
	var pulse := 1.0 + sin(_time * pulse_speed) * pulse_amount
	var motion_energy := clampf(_velocity.length() / maximum_speed, 0.0, 1.0)
	var motion_direction := _velocity.normalized() if _velocity.length() > 0.001 else Vector2.ZERO
	var shimmer_offset := Vector2(
		cos(_time * 1.8),
		sin(_time * 1.35)
	) * 0.9

	_draw_glow(Vector2.ZERO, glow_radius * 1.45 * pulse, Color(1.0, 0.72, 0.39, 0.075))
	_draw_glow(Vector2.ZERO, glow_radius * 0.82 * pulse, Color(1.0, 0.86, 0.61, 0.14))
	_draw_glow(Vector2.ZERO, glow_radius * 0.38 * pulse, Color(1.0, 0.95, 0.79, 0.19))

	for particle in _trail_particles:
		var life_ratio: float = 1.0 - (float(particle["age"]) / float(particle["lifetime"]))
		var particle_pos: Vector2 = Vector2(particle["world_position"]) - global_position
		var particle_radius: float = float(particle["radius"]) * (0.8 + life_ratio * 0.45)
		var particle_alpha: float = float(particle["alpha"]) * life_ratio
		_draw_glow(particle_pos, particle_radius * 4.0, Color(1.0, 0.84, 0.55, particle_alpha * 0.28))
		draw_circle(particle_pos, particle_radius, Color(1.0, 0.95, 0.78, particle_alpha))

	for mote in _ambient_motes:
		var angle: float = float(mote["angle"]) + _time * float(mote["speed"])
		var orbit: Vector2 = Vector2.RIGHT.rotated(angle) * float(mote["orbit_radius"])
		var flicker: float = 0.78 + (sin(_time * (float(mote["speed"]) * 5.0) + angle) * 0.22)
		_draw_glow(
			orbit,
			float(mote["size"]) * 3.0 * flicker,
			Color(1.0, 0.92, 0.72, float(mote["alpha"]) * flicker)
		)

	var tail_offset := -motion_direction * (2.0 + motion_energy * 4.5)
	_draw_glow(tail_offset, (core_radius + 5.0) * pulse, Color(1.0, 0.82, 0.55, 0.07 + motion_energy * 0.035))
	_draw_glow(shimmer_offset, core_radius * 2.5 * pulse, Color(1.0, 1.0, 0.97, 0.11))
	draw_circle(Vector2.ZERO, (core_radius + 0.8) * pulse, Color(1.0, 0.95, 0.83, 0.2))
	draw_circle(Vector2.ZERO, core_radius * pulse, Color(1.0, 0.99, 0.94, 0.96))
