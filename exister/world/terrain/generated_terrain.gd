@tool
extends MeshInstance3D

## A deliberately small native-Godot terrain sketcher.
##
## The overworld itself is authored and static. Noise is only a sculpting aid:
## broad hand-shaped landforms define the geography, while low-frequency noise
## keeps the surface from feeling mathematically perfect.

@export_group("Shape")
@export_range(24, 192, 1) var resolution: int = 112
@export_range(40.0, 400.0, 1.0) var world_size: float = 160.0
@export var terrain_seed: int = 4101987
@export_range(0.001, 0.08, 0.001) var base_frequency: float = 0.010
@export_range(0.0, 6.0, 0.1) var base_noise_height: float = 2.2
@export_range(0.001, 0.2, 0.001) var detail_frequency: float = 0.040
@export_range(0.0, 2.0, 0.05) var detail_noise_height: float = 0.35

@export_group("Authored Landforms")
@export_range(0.0, 24.0, 0.1) var main_hill_height: float = 11.0
@export_range(8.0, 80.0, 1.0) var main_hill_radius: float = 30.0
@export_range(0.0, 12.0, 0.1) var valley_depth: float = 3.8
@export_range(0.0, 18.0, 0.1) var distant_ridge_height: float = 7.5
@export_range(0.0, 1.0, 0.01) var meadow_flattening: float = 0.78

@export_group("Surface Colors")
@export var low_color: Color = Color("6f925f")
@export var mid_color: Color = Color("89a96f")
@export var high_color: Color = Color("b6b181")

var _last_signature: String = ""


func _ready() -> void:
	_build_if_needed(true)


func _process(_delta: float) -> void:
	if Engine.is_editor_hint():
		_build_if_needed(false)


func _build_if_needed(force: bool) -> void:
	var signature := "%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s" % [
		resolution,
		world_size,
		terrain_seed,
		base_frequency,
		base_noise_height,
		detail_frequency,
		detail_noise_height,
		main_hill_height,
		main_hill_radius,
		valley_depth,
		distant_ridge_height,
		meadow_flattening,
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
	base_noise.fractal_octaves = 3
	base_noise.fractal_gain = 0.42
	base_noise.fractal_lacunarity = 1.85

	var detail_noise := FastNoiseLite.new()
	detail_noise.seed = terrain_seed + 7919
	detail_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	detail_noise.frequency = detail_frequency
	detail_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	detail_noise.fractal_octaves = 2
	detail_noise.fractal_gain = 0.4

	var surface := SurfaceTool.new()
	surface.begin(Mesh.PRIMITIVE_TRIANGLES)

	var step := world_size / float(resolution)

	for z in range(resolution + 1):
		for x in range(resolution + 1):
			var local_x := -world_size * 0.5 + float(x) * step
			var local_z := -world_size * 0.5 + float(z) * step
			var height := _sample_height(base_noise, detail_noise, local_x, local_z)

			surface.set_color(_terrain_color(height))
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

	surface.generate_normals()

	var generated_mesh := surface.commit()
	if generated_mesh == null:
		return

	var material := StandardMaterial3D.new()
	material.vertex_color_use_as_albedo = true
	material.roughness = 0.98
	material.metallic = 0.0
	material.cull_mode = BaseMaterial3D.CULL_BACK
	generated_mesh.surface_set_material(0, material)
	mesh = generated_mesh


func _sample_height(base_noise: FastNoiseLite, detail_noise: FastNoiseLite, x: float, z: float) -> float:
	# Start with broad, quiet undulation rather than mountain-producing noise.
	var height: float = base_noise.get_noise_2d(x, z) * base_noise_height
	height += detail_noise.get_noise_2d(x, z) * detail_noise_height

	# Main hill: deliberately off-center so the first landscape has a landmark.
	height += _gaussian_2d(x, z, -27.0, -8.0, main_hill_radius, main_hill_radius * 0.78) * main_hill_height

	# A long shallow valley crossing the middle-right side of the landscape.
	height -= _gaussian_2d(x, z, 20.0, 4.0, 24.0, 42.0) * valley_depth

	# A distant ridge gives the horizon a readable destination without turning
	# the whole terrain into mountains.
	var ridge_shape: float = exp(-pow((z + 58.0) / 16.0, 2.0))
	var ridge_variation: float = 0.72 + base_noise.get_noise_2d(x * 0.65, z * 0.4) * 0.28
	height += ridge_shape * ridge_variation * distant_ridge_height

	# The near-center meadow is intentionally calm and relatively flat. Noise
	# still survives at the edges so the transition into surrounding land is soft.
	var meadow_mask: float = _gaussian_2d(x, z, 0.0, 24.0, 38.0, 28.0)
	var flatten_amount: float = clampf(meadow_mask * meadow_flattening, 0.0, 1.0)
	height = lerpf(height, 0.8, flatten_amount)

	# Very gently lift the outer perimeter. This creates a contained place rather
	# than an infinite-looking flat sheet, without producing a bowl of jagged ridges.
	var edge_distance: float = Vector2(x, z).length() / (world_size * 0.5)
	var edge_lift: float = smoothstep(0.68, 1.0, edge_distance) * 2.4
	height += edge_lift

	return height


func _gaussian_2d(
	x: float,
	z: float,
	center_x: float,
	center_z: float,
	radius_x: float,
	radius_z: float
) -> float:
	var dx: float = (x - center_x) / maxf(radius_x, 0.001)
	var dz: float = (z - center_z) / maxf(radius_z, 0.001)
	return exp(-(dx * dx + dz * dz) * 2.0)


func _terrain_color(height: float) -> Color:
	if height < 1.5:
		var low_t: float = inverse_lerp(-4.0, 1.5, height)
		return low_color.darkened(0.08).lerp(low_color, clampf(low_t, 0.0, 1.0))

	if height < 6.0:
		var mid_t: float = inverse_lerp(1.5, 6.0, height)
		return low_color.lerp(mid_color, clampf(mid_t, 0.0, 1.0))

	var high_t: float = inverse_lerp(6.0, 13.0, height)
	return mid_color.lerp(high_color, clampf(high_t, 0.0, 1.0))
