  // ============================================================
  // 実装ステップ (Ray Tracing in One Weekend 準拠)
  // ============================================================
  // Step 1: 疑似乱数関数の実装 (§8.1)              [完了]
  // Step 2: Lambertian拡散反射 (§9.1-9.4)          [完了]
  // Step 3: ガンマ補正 (§9.5)                       [完了]
  // Step 4: マテリアルシステム導入 (§10.1-10.3)     [完了]
  // Step 5: Metal反射 + fuzz (§10.4-10.6)           [完了]
  // Step 6: Dielectric 屈折+フレネル (§11.1-11.5)   [完了]
  // Step 7: 球体数の増加 (§14.1)                    [TODO]
  // Step 8: 被写界深度 (§13.1-13.2)                 [TODO]
  // ============================================================

  // ============================================================
  // [1] precision / uniforms / constants
  // ============================================================
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform float t;
  uniform vec2  r;
  uniform float sceneSeed;

  const vec3 LDR = vec3(0.577);
  const float EPS = 1.0e-4;
  const int SAMPLES_PER_PIXEL = 20;
  const int MAX_REF = 4;

  const float pi = acos(-1.0);

  // マテリアルの種類
  const int MAT_LAMBERTIAN = 0;
  const int MAT_METAL = 1;
  const int MAT_DIELECTRIC = 2;

  const int GRID_COLS = 5;
  const int GRID_ROWS = 5;
  const int NUM_SPHERES = 3 + GRID_COLS * GRID_ROWS;

  // ============================================================
  // [2] 構造体定義
  // ============================================================
  struct Ray{
	vec3 origin;
	vec3 direction;
  };

  struct Material{
	int type;
	float fuzz; // 金属マテリアルにおける反射時のぼやけの強さ
	float ref_idx; // 誘電体マテリアルの屈折率
	vec3 albedo;
  };

  struct Sphere{
	float radius;
	vec3  position;
	vec3  color;
	Material material;
  };

  struct Plane{
	vec3 position;
	vec3 normal;
	vec3 color;
	Material material;
  };

  struct Intersection{
	int hit;
	vec3 hitPoint; // 交点の座標
	vec3 normal;   // 交点位置の法線
	vec3 color;    // 交点位置の色
	float distance;
	vec3 rayDir;
	Material material;
  };

  Sphere sphere[NUM_SPHERES];
  Plane plane;

  // ============================================================
  // [3] 疑似乱数関数
  // ============================================================
  vec2 randSeed;

  float random() {
    randSeed += vec2(0.6180339887, 0.3819660113);
    vec3 p3 = fract(vec3(randSeed.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float random(float min_val, float max_val) {
	return min_val + (max_val - min_val) * random();
  }

  vec3 random_vec3() {
	return vec3(random(), random(), random());
  }

  vec3 random_vec3(float min_val, float max_val) {
	return vec3(
		random(min_val, max_val),
		random(min_val, max_val),
		random(min_val, max_val)
	);
  }

  vec3 random_in_unit_vector() {
	float a = random(0.0, 2.0 * pi);
	float z = random(-1.0, 1.0);
	float r = sqrt(1.0 - z * z);
	return vec3(r * cos(a), r * sin(a), z);
  }

  vec2 sample_square() {
	return vec2(random() - 0.5, random() - 0.5);
  }

  float scene_seed;
  float scene_random() {
	scene_seed += 0.6180339887;
	return fract(sin(scene_seed * 78.233) * 43758.5453);
  }

  float scene_random(float min_val, float max_val) {
	return min_val + (max_val - min_val) * scene_random();
  }

  // ============================================================
  // [4] マテリアル散乱関数
  // ============================================================
  float schlick(float cosine, float ref_idx) {
	float r0 = (1.0 - ref_idx) / (1.0 + ref_idx);
	r0 = r0 * r0;
	return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
  }

  bool scatter(Intersection I, inout vec3 albedo, inout Ray ray) {
	if (I.material.type == MAT_METAL) {
		// 金属マテリアル
		vec3 reflected = reflect(I.rayDir, I.normal);
		ray.origin = I.hitPoint + I.normal * EPS;
		ray.direction = reflected + I.material.fuzz * random_in_unit_vector();
		albedo = I.material.albedo;
		return (dot(ray.direction, I.normal) > 0.0);
	} else if (I.material.type == MAT_DIELECTRIC) {
		// 誘電体マテリアル
		float etai_over_etat;
		vec3 normal;
		if (dot(I.rayDir, I.normal) < 0.0) {
			// 物体の外から入る
			etai_over_etat = 1.0 / I.material.ref_idx;
			normal = I.normal;
		} else {
			etai_over_etat = I.material.ref_idx;
			normal = -I.normal;
		}

		vec3 unit_direction = normalize(I.rayDir);
		float cos_theta = min(dot(-unit_direction, normal), 1.0);
		float sin_theta = sqrt(1.0 - cos_theta * cos_theta);
		if (etai_over_etat * sin_theta > 1.0) {
			// 全反射
			vec3 reflected = reflect(I.rayDir, normal);
			ray.origin = I.hitPoint + normal * EPS;
			ray.direction = reflected;

			albedo = vec3(1.0);
			return true;
		}

		float reflect_prob = schlick(cos_theta, etai_over_etat);
		if (random() < reflect_prob) {
			vec3 reflected = reflect(unit_direction, normal);
			ray.origin = I.hitPoint + normal * EPS;
			ray.direction = reflected;

			albedo = vec3(1.0);
			return true;
		}

		vec3 refracted = refract(normalize(I.rayDir), normal, etai_over_etat);
		ray.origin = I.hitPoint - normal * EPS;
		ray.direction = refracted;

		albedo = vec3(1.0);
		return true;
	} else {
		// Lambertian散乱
		vec3 scatter_direction = I.normal + random_in_unit_vector();
		ray.origin = I.hitPoint + I.normal * EPS;
		ray.direction = scatter_direction;
		albedo = I.material.albedo;
		return true;
	}
  }

  // ============================================================
  // [5] 交差判定関数
  // ============================================================
  void intersectInit(inout Intersection I){
	I.hit      = 0;
	I.hitPoint = vec3(0.0);
	I.normal   = vec3(0.0);
	I.distance = 1.0e+30;
	I.rayDir   = vec3(0.0);
  }

  void intersectSphere(Ray R, Sphere S, inout Intersection I){
	vec3  a = R.origin - S.position;
	float b = dot(a, R.direction);
	float c = dot(a, a) - (S.radius * S.radius);
	float d = b * b - c;
	float t = -b - sqrt(d);

	if(d > 0.0 && t > 0.0 && t < I.distance){
		I.hitPoint = R.origin + R.direction * t;
		I.normal = normalize(I.hitPoint - S.position);
		I.distance = t;
		I.hit++;
		I.rayDir = R.direction;
		I.material = S.material;
	}
  }

  void intersectPlane(Ray R, Plane P, inout Intersection I){
	float d = -dot(P.position, P.normal);
	float v = dot(R.direction, P.normal);
	float t = -(dot(R.origin, P.normal) + d) / v;
	if (t > EPS && t < I.distance){
		I.hitPoint = R.origin + R.direction * t;
		I.normal = P.normal;
		I.distance = t;
		I.hit++;
		I.rayDir = R.direction;
		I.material = P.material;
	}
  }

  void intersectExec(Ray R, inout Intersection I){
	for (int i = 0; i < NUM_SPHERES; i++) {
		intersectSphere(R, sphere[i], I);
	}
	intersectPlane(R, plane, I);
  }

  // ============================================================
  // [6] ray_color 関数
  // ============================================================
  vec3 ray_color(Ray ray){
	Intersection its;

	vec3 tempColor = vec3(1.0);
	for (int i = 0; i < MAX_REF; i++) {
		intersectInit(its);
		intersectExec(ray, its);
		if (its.hit > 0) {
			vec3 albedo;
			scatter(its, albedo, ray);
			tempColor *= albedo;
		} else {
			vec3 unit_direction = normalize(ray.direction);
			float t = 0.5 * (unit_direction.y + 1.0);
			return tempColor * ((1.0 - t) * vec3(1.0) + t * vec3(0.5, 0.7, 1.0));
		}
	}
	return vec3(0.0);
  }

  // ============================================================
  // [7] main (カメラ設定, シーン構築, 出力)
  // ============================================================
  void main(void){

	// camera paramters init
	vec3 lookfrom = vec3(13.0, 0.5, 3.0);
	vec3 lookat = vec3(0.0);
	vec3 vup = vec3(0.0, 1.0, 0.0);
	float vfov = 20.0;

	// カメラの正規直交基底を計算
	float half_height = tan(vfov * pi / 360.0);
	float half_width = half_height * (r.x /r.y);

	vec3 w = normalize(lookfrom - lookat);
	vec3 u = normalize(cross(vup, w));
	vec3 v = cross(w, u);

	// random seed init
	randSeed = gl_FragCoord.xy + vec2(t);

	// sphere init

	// 大球の設定
	sphere[0].radius = 1.0;
	sphere[0].position = vec3(-2.0, 0.0, 0.0);
	sphere[0].material.type = MAT_DIELECTRIC;
	sphere[0].material.albedo = vec3(1.0);
	sphere[0].material.ref_idx = 1.5;

	sphere[1].radius = 1.0;
	sphere[1].position = vec3(-7.0, 0.0, 0.0);
	sphere[1].material.type = MAT_LAMBERTIAN;
	sphere[1].material.albedo = vec3(0.4, 0.2, 0.1);

	sphere[2].radius = 1.0;
	sphere[2].position = vec3(3.0, 0.0, 0.0);
	sphere[2].material.type = MAT_METAL;
	sphere[2].material.albedo = vec3(0.7, 0.6, 0.5);

	// 小球の設定
	float radius_mini_sphere = 0.2;
	float y_mini_sphere = -0.8;
	scene_seed = sceneSeed;
	float step_a = 22.0 / float(GRID_ROWS);
	float step_b = 22.0 / float(GRID_COLS);
	for (int i = 3; i < NUM_SPHERES; i++) {
		float a = float((i - 3) / GRID_COLS) * step_a - 11.0;
		float b = mod(float(i - 3), float(GRID_COLS)) * step_b - 11.0;
		sphere[i].radius = radius_mini_sphere;
		sphere[i].position = vec3(a + 0.9 * scene_random(), 
								y_mini_sphere, 
								b + 0.9 * scene_random());
		float material_type_rand = scene_random();
		if (material_type_rand <= 0.8) {
			sphere[i].material.type = MAT_LAMBERTIAN;
		} else if (material_type_rand <= 0.95) {
			sphere[i].material.type = MAT_METAL;
		} else {
			sphere[i].material.type = MAT_DIELECTRIC;
		}
		sphere[i].material.albedo = vec3(scene_random(), scene_random(), scene_random());
		if (sphere[i].material.type == MAT_DIELECTRIC) {
			sphere[i].material.ref_idx = 1.5;
		} else if (sphere[i].material.type == MAT_METAL) {
			sphere[i].material.fuzz = scene_random(0.0, 0.1);
		}

		// 大球との衝突判定
		for (int j = 0; j < 3; j++) {
			if (distance(sphere[j].position, sphere[i].position) < sphere[j].radius + sphere[i].radius) {
				sphere[i].radius = 0.0;
				break;
			}
		}
	}


	// plane init
	plane.position = vec3(0.0, -1.0, 0.0);
	plane.normal = vec3(0.0, 1.0, 0.0);
	plane.material.albedo = vec3(0.5);

	Ray ray;
	ray.origin = lookfrom;
	vec3 col = vec3(0.0);
	for (int sample = 0; sample < SAMPLES_PER_PIXEL; sample++) {
		vec2 offset = sample_square() / min(r.x, r.y);
		vec2 uv = gl_FragCoord.xy / r + offset;
		ray.direction = normalize(
			(2.0 * uv.x - 1.0) * half_width * u + 
			(2.0 * uv.y - 1.0) * half_height * v - w
		);
		col += ray_color(ray) / float(SAMPLES_PER_PIXEL);
	}
	gl_FragColor = vec4(sqrt(col), 1.0);
  }
