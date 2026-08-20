extends Node2D

const ACTION_SPACE_SCENE := preload("res://exister/ui/action_space.tscn")
const TITLE_FONT_PATH := "res://exister/fonts/Isenheim_Fin.otf"
const BODY_FONT_PATH := "res://exister/fonts/CrimsonPro-Regular.ttf"

@onready var wisp: Node2D = $Wisp
@onready var scene_fade: CanvasLayer = $SceneFade

var _title_font: Font
var _body_font: Font
var _color_buttons: Dictionary = {}
var _size_buttons: Dictionary = {}


func _ready() -> void:
	_title_font = load(TITLE_FONT_PATH) as Font
	_body_font = load(BODY_FONT_PATH) as Font
	_build_buttons()
	_apply_profile_to_wisp()
	_layout_scene()
	call_deferred("_fade_in")
	queue_redraw()


func _process(_delta: float) -> void:
	var action_pressed := Input.is_action_pressed("interact")
	for button in _all_buttons():
		button.call("set_interaction", wisp.global_position, action_pressed)


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_SIZE_CHANGED:
		_layout_scene()
		queue_redraw()


func _build_buttons() -> void:
	_create_choice_button("GOLD", "gold", _color_buttons, _on_color_selected)
	_create_choice_button("MOON", "moon", _color_buttons, _on_color_selected)
	_create_choice_button("MOSS", "moss", _color_buttons, _on_color_selected)

	_create_choice_button("SMALL", "small", _size_buttons, _on_size_selected)
	_create_choice_button("REGULAR", "regular", _size_buttons, _on_size_selected)
	_create_choice_button("LARGE", "large", _size_buttons, _on_size_selected)

	_refresh_selected_states()


func _create_choice_button(label: String, id: String, collection: Dictionary, callback: Callable) -> void:
	var button := ACTION_SPACE_SCENE.instantiate() as Node2D
	button.name = label.capitalize().replace(" ", "")
	button.set("button_size", Vector2(210.0, 82.0))
	button.set("label_text", label)
	button.set("font_size", 20)
	button.set("particle_count", 38)
	button.connect("activated", callback.bind(id))
	add_child(button)
	collection[id] = button


func _all_buttons() -> Array[Node2D]:
	var buttons: Array[Node2D] = []
	for button in _color_buttons.values():
		buttons.append(button as Node2D)
	for button in _size_buttons.values():
		buttons.append(button as Node2D)
	return buttons


func _layout_scene() -> void:
	var viewport_size := get_viewport_rect().size
	var center_x := viewport_size.x * 0.5
	var horizontal_spacing := minf(250.0, viewport_size.x * 0.22)

	_layout_row(_color_buttons, ["gold", "moon", "moss"], center_x, viewport_size.y * 0.35, horizontal_spacing)
	_layout_row(_size_buttons, ["small", "regular", "large"], center_x, viewport_size.y * 0.58, horizontal_spacing)


	wisp.call("place_at", viewport_size * Vector2(0.5, 0.92))


func _layout_row(collection: Dictionary, ids: Array, center_x: float, y: float, spacing: float) -> void:
	for i in range(ids.size()):
		var button := collection[ids[i]] as Node2D
		button.position = Vector2(center_x + (float(i - 1) * spacing), y)


func _on_color_selected(id: String) -> void:
	PlayerProfile.set_color(id)
	_apply_profile_to_wisp()
	_refresh_selected_states()
	queue_redraw()


func _on_size_selected(id: String) -> void:
	PlayerProfile.set_size(id)
	_apply_profile_to_wisp()
	_refresh_selected_states()
	queue_redraw()


func _apply_profile_to_wisp() -> void:
	var size_data := PlayerProfile.get_size_data()
	wisp.call(
		"apply_profile",
		PlayerProfile.get_color(),
		float(size_data["scale"]),
		float(size_data["speed_multiplier"])
	)


func _refresh_selected_states() -> void:
	for id in _color_buttons:
		_color_buttons[id].call("set_selected", id == PlayerProfile.color_id)
	for id in _size_buttons:
		_size_buttons[id].call("set_selected", id == PlayerProfile.size_id)


func _fade_in() -> void:
	scene_fade.call("fade_in", 1.65)


func _draw() -> void:
	var viewport_size := get_viewport_rect().size
	draw_rect(Rect2(Vector2.ZERO, viewport_size), Color.BLACK, true)
	_draw_heading(viewport_size)
	_draw_section_label("COLOR", viewport_size.y * 0.245)
	_draw_section_label("SIZE", viewport_size.y * 0.475)
	_draw_stats(viewport_size)


func _draw_heading(viewport_size: Vector2) -> void:
	if _title_font == null:
		return

	var title := "Choose your wisp"
	var font_size := maxi(42, int(viewport_size.y * 0.072))
	var text_size := _title_font.get_string_size(title, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
	var position := Vector2((viewport_size.x - text_size.x) * 0.5, viewport_size.y * 0.13)
	draw_string(_title_font, position, title, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(0.82, 0.79, 0.71, 0.24))


func _draw_section_label(text: String, y: float) -> void:
	if _body_font == null:
		return

	var font_size := 15
	var viewport_size := get_viewport_rect().size
	var text_size := _body_font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
	var position := Vector2((viewport_size.x - text_size.x) * 0.5, y)
	draw_string(_body_font, position, text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(0.72, 0.70, 0.65, 0.48))


func _draw_stats(viewport_size: Vector2) -> void:
	if _body_font == null:
		return

	var size_data := PlayerProfile.get_size_data()
	var speed_percent := int(round(float(size_data["speed_multiplier"]) * 100.0))
	var text := "%d HP  ·  %d%% movement" % [PlayerProfile.get_hp(), speed_percent]
	var font_size := 15
	var text_size := _body_font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size)
	var position := Vector2((viewport_size.x - text_size.x) * 0.5, viewport_size.y * 0.69)
	draw_string(_body_font, position, text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(0.72, 0.70, 0.65, 0.42))
