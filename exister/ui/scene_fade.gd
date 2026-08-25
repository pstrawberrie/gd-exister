extends CanvasLayer

@export var fade_color: Color = Color.BLACK
@export var default_duration: float = 1.4
@export var start_opaque: bool = false

var _overlay: ColorRect
var _busy: bool = false


func _ready() -> void:
	layer = 100
	_overlay = ColorRect.new()
	_overlay.position = Vector2.ZERO
	_overlay.size = get_viewport().get_visible_rect().size
	_overlay.color = Color(fade_color.r, fade_color.g, fade_color.b, 1.0 if start_opaque else 0.0)
	_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_overlay)
	get_viewport().size_changed.connect(_sync_overlay_size)


func fade_to_scene(scene_path: String, duration: float = -1.0) -> void:
	if _busy:
		return

	_busy = true
	var fade_duration := default_duration if duration < 0.0 else duration
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(_overlay, "color:a", 1.0, fade_duration)
	await tween.finished
	get_tree().change_scene_to_file(scene_path)


func fade_in(duration: float = -1.0) -> void:
	var fade_duration := default_duration if duration < 0.0 else duration
	_overlay.color.a = 1.0
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(_overlay, "color:a", 0.0, fade_duration)
	await tween.finished
	_busy = false


func _sync_overlay_size() -> void:
	_overlay.size = get_viewport().get_visible_rect().size
