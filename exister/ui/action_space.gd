extends Node2D

## Reusable Exister world-space action zone.
## Transparent center, organic outline, proximity glow, and interior action particles.

signal activated

@export var button_size: Vector2 = Vector2(300.0, 116.0)
@export var label_text: String = "Enter"
@export var font_size: int = 24
@export var particle_count: int = 54

var _occupied: bool = false
var _action_pressed: bool = false
var _last_action_pressed: bool = false
var _selected: bool = false
var _state_energy: float = 0.0
var _action_energy: float = 0.0
var _time: float = 0.0
var _particles: Array[Dictionary] = []
var _outline_points := PackedVector2Array()
var _label_font: Font

const IDLE_BORDER := Color(0.87, 0.82, 0.72, 0.56)
const ACTION_GOLD := Color(0.92, 0.69, 0.27, 1.0)
const ACTION_GOLD_SOFT := Color(0.96, 0.80, 0.43, 1.0)
const LABEL_FONT_PATH := "res://exister/fonts/CrimsonPro-ExtraBold.ttf"


func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_label_font = load(LABEL_FONT_PATH) as Font
	_outline_points = _sample_outline()
	_build_particles()
	queue_redraw()


func _process(delta: float) -> void:
	_time += delta
	var target_state: float = 1.0 if _occupied else (0.26 if _selected else 0.0)
	var target_action: float = 1.0 if (_occupied and _action_pressed) else 0.0
	_state_energy = move_toward(_state_energy, target_state, delta * 5.0)
	_action_energy = move_toward(_action_energy, target_action, delta * 7.0)

	if _state_energy > 0.01 or _occupied:
		_update_particles(delta)

	queue_redraw()


func set_interaction(wisp_global_position: Vector2, action_pressed: bool) -> void:
	var local_point := to_local(wisp_global_position)
	_occupied = _contains_local_point(local_point)
	_action_pressed = action_pressed

	if _occupied and _action_pressed and not _last_action_pressed:
		activated.emit()

	_last_action_pressed = _action_pressed


func set_selected(value: bool) -> void:
	_selected = value


func is_occupied() -> bool:
	return _occupied


func _contains_local_point(local_point: Vector2) -> bool:
	var half_size := button_size * 0.5
	if half_size.x <= 0.0 or half_size.y <= 0.0:
		return false

	var normalized := Vector2(local_point.x / half_size.x, local_point.y / half_size.y)
	return normalized.length_squared() <= 1.0


func _build_particles() -> void:
	_particles.clear()
	for i in range(particle_count):
		_particles.append(_new_particle(true))


func _new_particle(random_age: bool = false) -> Dictionary:
	var half_size := button_size * 0.5
	var angle := randf() * TAU
	var radius := sqrt(randf()) * 0.72
	var position_in_button := Vector2(
		cos(angle) * half_size.x * radius,
		sin(angle) * half_size.y * radius
	)
	return {
		"position": position_in_button,
		"velocity": Vector2(randf_range(-8.0, 8.0), randf_range(-5.0, 5.0)),
		"phase": randf() * TAU,
		"size": randf_range(1.1, 2.6),
		"alpha": randf_range(0.24, 0.56),
		"age": randf_range(0.0, 8.0) if random_age else 0.0,
	}


func _update_particles(delta: float) -> void:
	var half_size := button_size * 0.5
	var speed_multiplier: float = 1.0 + (_action_energy * 0.8)

	for i in range(_particles.size()):
		var particle := _particles[i]
		var particle_position: Vector2 = Vector2(particle["position"])
		var particle_velocity: Vector2 = Vector2(particle["velocity"])
		var particle_phase: float = float(particle["phase"])
		var particle_age: float = float(particle["age"]) + delta

		particle_position += particle_velocity * delta * speed_multiplier
		particle_position.y += sin((_time * 0.75) + particle_phase) * delta * 3.0

		var nx: float = particle_position.x / maxf(half_size.x * 0.72, 1.0)
		var ny: float = particle_position.y / maxf(half_size.y * 0.72, 1.0)
		if (nx * nx) + (ny * ny) > 1.0:
			particle = _new_particle()
		else:
			particle["position"] = particle_position
			particle["age"] = particle_age

		_particles[i] = particle


func _sample_outline(samples: int = 112) -> PackedVector2Array:
	var points := PackedVector2Array()
	var half_size := button_size * 0.5

	for i in range(samples + 1):
		var t: float = (float(i) / float(samples)) * TAU
		var x_scale: float = 0.94 + (sin(t * 2.0 + 0.5) * 0.035) + (sin(t * 3.0) * 0.018)
		var y_scale: float = 0.78 + (cos(t * 3.0 - 0.7) * 0.045)
		var x_offset: float = sin(t) * half_size.x * 0.015

		points.append(Vector2(
			cos(t) * half_size.x * x_scale + x_offset,
			sin(t) * half_size.y * y_scale
		))

	return points


func _draw_polyline_glow(points: PackedVector2Array, base_width: float) -> void:
	if _state_energy > 0.001:
		draw_polyline(points, Color(ACTION_GOLD.r, ACTION_GOLD.g, ACTION_GOLD.b, 0.06 * _state_energy), base_width + (16.0 * _state_energy), true)
		draw_polyline(points, Color(ACTION_GOLD.r, ACTION_GOLD.g, ACTION_GOLD.b, 0.11 * _state_energy), base_width + (8.0 * _state_energy), true)

	var active_color := IDLE_BORDER.lerp(ACTION_GOLD_SOFT, _state_energy)
	active_color = active_color.lerp(Color(1.0, 0.9, 0.48, 1.0), _action_energy)
	active_color.a = lerpf(IDLE_BORDER.a, 0.98, _state_energy)
	draw_polyline(points, active_color, base_width + (_action_energy * 0.45), true)


func _draw_particles() -> void:
	if _state_energy <= 0.01:
		return

	for particle in _particles:
		var particle_position: Vector2 = Vector2(particle["position"])
		var phase: float = float(particle["phase"])
		var size: float = float(particle["size"])
		var alpha: float = float(particle["alpha"])
		var twinkle: float = 0.72 + sin((_time * 1.7) + phase) * 0.28
		var action_boost: float = 1.0 + (_action_energy * 0.8)
		var final_alpha: float = alpha * twinkle * _state_energy * action_boost
		draw_circle(particle_position, size * (1.0 + _action_energy * 0.3), Color(0.88, 0.74, 0.38, final_alpha))
		draw_circle(particle_position, size * 3.2, Color(0.78, 0.58, 0.20, final_alpha * 0.11))


func _draw_label() -> void:
	if _label_font == null or label_text.is_empty():
		return

	var text_size := _label_font.get_string_size(label_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
	var text_position := Vector2(-text_size.x * 0.5, text_size.y * 0.34)
	var label_color := Color(0.78, 0.75, 0.68, 0.74).lerp(Color(1.0, 0.84, 0.46, 0.96), _state_energy)
	label_color = label_color.lerp(Color(1.0, 0.92, 0.62, 1.0), _action_energy)
	draw_string(_label_font, text_position, label_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, label_color)


func _draw() -> void:
	_draw_polyline_glow(_outline_points, 1.15)
	_draw_particles()
	_draw_label()
