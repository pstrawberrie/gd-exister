@tool
extends MeshInstance3D

## A deliberately small native-Godot terrain sketcher.
##
## The fixed seed makes the generated landform deterministic. The purpose is
## authoring: tune the parameters until a landform feels right, then eventually
## fossilize/bake the geography rather than randomizing the overworld at runtime.

@export_group("Shape")
@export_range(16, 192, 1) var resolution: int = 96
@export_range(20.0, 400.0, 1.0) var world_size: float = 140.0
@export_range(0.0, 40.0, 0.1) var height_scale: float = 13.0
@export var terrain_seed: int = 4101987
@export_range(0.001, 0.2, 0.001) var base_frequency: float = 0.018
@export_range(0.0, 1.0, 0.01) var detail_strength: float = 0.28
@export_range(0.001, 0.3, 0.001) var detail_frequency: float = 0.065

@export_group("Landform")
@export_range(0.0, 1.0, 0.01) var basin_strength: float = 0.34
@export_range(0.1, 3.0, 0.05) var basin_power: float = 1.35

@export_group("Surface Colors")
@export var low_color: Color = Color("18221b")
@export var mid_color: Color = Color("28352a")
@export var high_color: Color = Color("4a5142")

var _last_signature: String = ""


func _ready() -> void:
	_build_if_needed(true)


func _process(_delta: float) -> void:
	if Engine.is_editor_hint():
		_build_if_needed(false)


func _build_if_needed(force: bool) -> void:
	var signature := "%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s" % [
		resolution,
		world_size,
		height_scale,
		terrain_seed,
		base_frequency,
		detail_strength,
		detail_frequency,
		basin_strength,
		basin_power,
		low_color.to_html(),
		mid_color.to_html(),
		high_color.to_html()
	]

	if not force and signature == _last_signature:
		return

	_last_signature = signature
	_build_terrain()


func _build_terrain() -> void:
	var base_noise := FastNoiseLite.new()
	base_noise.seed = terrain_seed
	base_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	base_noise.frequency = base_frequency
	base_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	base_noise.fractal_octaves = 5
	base_noise.fractal_gain = 0.48
	base_noise.fractal_lacunarity = 2.0

	var detail_noise := FastNoiseLite.new()
	detail_noise.seed = terrain_seed + 7919
	detail_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	detail_noise.frequency = detail_frequency
	detail_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	detail_noise.fractal_octaves = 3
	detail_noise.fractal_gain = 0.5

	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)

	var vertex_count := (resolution + 1) * (resolution + 1)
	var step := world_size / float(resolution)

	for z in range(resolution + 1):
		for x in range(resolution + 1):
			var local_x := -world_size * 0.5 + float(x) * step
			var local_z := -world_size * 0.5 + float(z) * step
			var height := _sample_height(base_noise, detail_noise, local_x, local_z)
			var normalized_height := clampf((height / maxf(height_scale, 0.001) + 1.0) * 0.5, 0.0, 1.0)
			var color := _terrain_color(normalized_height)

			surface.set_color(color)
			surface.add_vertex(Vector3(local_x, height, local_z))

	for z in range(resolution):
		for x in range(resolution):
			var row := resolution + 1
			var a := z * row + x
			var b := a + 1
			var c := a + row
			var d := c + 1

			surface.add_index(a)
			surface.add_index(c)
			surface.add_index(b)
			surface.add_index(b)
			surface.add_index(c)
			surface.add_index(d)

	if vertex_count > 0:
		surface.generate_normals()

	var generated_mesh := surface.commit()
	if generated_mesh == null:
		return

	var material := StandardMaterial3D.new()
	material.vertex_color_use_as_albedo = true
	material.roughness = 0.96
	material.metallic = 0.0
	material.cull_mode = BaseMaterial3D.CULL_BACK
	generated_mesh.surface_set_material(0, material)
	mesh = generated_mesh


func _sample_height(base_noise: FastNoiseLite, detail_noise: FastNoiseLite, x: float, z: float) -> float:
	var base := base_noise.get_noise_2d(x, z)
	var detail := detail_noise.get_noise_2d(x, z) * detail_strength

	# A broad authored basin keeps the first world sketch from becoming a generic
	# endless noise field and gives us a natural place to imagine water later.
	var distance_from_center := Vector2(x, z).length() / (world_size * 0.5)
	var basin := pow(clampf(distance_from_center, 0.0, 1.0), basin_power) * basin_strength
	var shaped := base + detail + basin

	return shaped * height_scale


func _terrain_color(height01: float) -> Color:
	if height01 < 0.52:
		return low_color.lerp(mid_color, height01 / 0.52)

	return mid_color.lerp(high_color, (height01 - 0.52) / 0.48)
