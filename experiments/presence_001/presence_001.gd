extends Node2D

@onready var wisp: Node2D = $Wisp


func _ready() -> void:
	_center_wisp()
	queue_redraw()


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_SIZE_CHANGED:
		queue_redraw()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept"):
		_center_wisp()


func _center_wisp() -> void:
	if wisp.has_method("place_at"):
		wisp.place_at(get_viewport_rect().size * 0.5)
	else:
		wisp.position = get_viewport_rect().size * 0.5


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, get_viewport_rect().size), Color.BLACK, true)
