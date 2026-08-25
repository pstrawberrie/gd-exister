extends Node2D

@onready var wisp: Node2D = $Wisp
@onready var action_space: Node = $EnterExister

var _title_font: Font


func _ready() -> void:
	_title_font = load("res://exister/fonts/Isenheim_Fin.otf") as Font
	_layout_scene()
	queue_redraw()


func _process(_delta: float) -> void:
	var action_pressed := Input.is_action_pressed("interact")
	if action_space.has_method("set_interaction"):
		action_space.set_interaction(wisp.global_position, action_pressed)


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_SIZE_CHANGED:
		_layout_scene()
		queue_redraw()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):
		_center_wisp()


func _layout_scene() -> void:
	var viewport_size := get_viewport_rect().size
	var center := viewport_size * 0.5
	$EnterExister.position = center
	_center_wisp()


func _center_wisp() -> void:
	var viewport_size := get_viewport_rect().size
	var start_position := viewport_size * Vector2(0.5, 0.72)
	if wisp.has_method("place_at"):
		wisp.place_at(start_position)
	else:
		wisp.position = start_position


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, get_viewport_rect().size), Color.BLACK, true)
	_draw_title()


func _draw_title() -> void:
	if _title_font == null:
		return

	var viewport_size := get_viewport_rect().size
	var font_size: int = maxi(92, int(viewport_size.y * 0.19))
	var title := "Exister"
	var text_size := _title_font.get_string_size(title, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
	var text_position := Vector2((viewport_size.x - text_size.x) * 0.5, viewport_size.y * 0.20)
	var title_color := Color(0.78, 0.76, 0.70, 0.14)
	draw_string(_title_font, text_position, title, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, title_color)
