extends Node2D

const SETUP_SCENE := "res://games/first_game/setup/setup.tscn"

@onready var wisp: Node2D = $Wisp
@onready var enter_button: Node2D = $EnterExister
@onready var scene_fade: CanvasLayer = $SceneFade

var _transitioning := false


func _ready() -> void:
	enter_button.connect("activated", _on_enter_exister)
	_layout_scene()
	queue_redraw()


func _process(_delta: float) -> void:
	if _transitioning:
		return

	enter_button.call(
		"set_interaction",
		wisp.global_position,
		Input.is_action_pressed("interact")
	)


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_SIZE_CHANGED:
		_layout_scene()
		queue_redraw()


func _layout_scene() -> void:
	var viewport_size := get_viewport_rect().size
	var center := viewport_size * 0.5
	enter_button.position = center

	var wisp_start := viewport_size * Vector2(0.5, 0.72)
	wisp.call("place_at", wisp_start)


func _on_enter_exister() -> void:
	if _transitioning:
		return

	_transitioning = true
	wisp.set_process(false)
	scene_fade.call("fade_to_scene", SETUP_SCENE, 1.65)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, get_viewport_rect().size), Color.BLACK, true)
