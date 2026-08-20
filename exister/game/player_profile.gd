extends Node

const COLOR_PRESETS := {
	"gold": Color(1.0, 0.82, 0.52, 1.0),
	"moon": Color(0.66, 0.82, 1.0, 1.0),
	"moss": Color(0.66, 0.88, 0.64, 1.0),
}

const SIZE_PRESETS := {
	"small": {
		"scale": 0.76,
		"speed_multiplier": 1.20,
		"hp": 70,
	},
	"regular": {
		"scale": 1.0,
		"speed_multiplier": 1.0,
		"hp": 100,
	},
	"large": {
		"scale": 1.28,
		"speed_multiplier": 0.80,
		"hp": 150,
	},
}

var color_id: String = "gold"
var size_id: String = "regular"


func set_color(value: String) -> void:
	if COLOR_PRESETS.has(value):
		color_id = value


func set_size(value: String) -> void:
	if SIZE_PRESETS.has(value):
		size_id = value


func get_color() -> Color:
	return COLOR_PRESETS.get(color_id, COLOR_PRESETS["gold"])


func get_size_data() -> Dictionary:
	return SIZE_PRESETS.get(size_id, SIZE_PRESETS["regular"])


func get_hp() -> int:
	return int(get_size_data()["hp"])
