extends Node3D

@export var focus_point: Vector3 = Vector3.ZERO

@onready var camera: Camera3D = $Camera3D


func _ready() -> void:
	camera.look_at(focus_point, Vector3.UP)
