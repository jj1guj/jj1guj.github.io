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

  const vec3 LDR = vec3(0.577);
  const float EPS = 1.0e-4;
  const int SAMPLES_PER_PIXEL = 20;
  const int MAX_REF = 4;

  const float pi = acos(-1.0);

  // マテリアルの種類
  const int MAT_LAMBERTIAN = 0;
  const int MAT_METAL = 1;
  const int MAT_DIELECTRIC = 2;

  const int NUM_SPHERES = 3;

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
	I.color    = vec3(0.0);
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
		float d = clamp(dot(normalize(vec3(1.0)), I.normal), 0.1, 1.0);
		I.color = S.color * d;
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
		float d = clamp(dot(I.normal, LDR), 0.1, 1.0);
		float m = mod(I.hitPoint.x, 2.0);
		float n = mod(I.hitPoint.z, 2.0);
		if ((m > 1.0 && n > 1.0) || (m < 1.0 && n < 1.0)){
			d *= 0.5;
		}
		float f = 1.0 - min(abs(I.hitPoint.z), 25.0) * 0.04;
		I.color = P.color * d * f;
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
	// fragment position
	vec2 p = (gl_FragCoord.xy * 2.0 - r) / min(r.x, r.y);

	// random seed init
	randSeed = gl_FragCoord.xy + vec2(t);

	// ray init
	Ray ray;
	ray.origin = vec3(0.0, 0.0, 5.0);
	ray.direction = normalize(vec3(p.x, p.y, -1.0));

	// sphere init
	sphere[0].radius = 0.5;
	// sphere[0].position = vec3(0.0, -0.5, sin(t));
	sphere[0].position = vec3(0.0, -0.5, -1.0);
	sphere[0].color = vec3(1.0, 1.0, 0.0);
	sphere[0].material.type = MAT_METAL;
	sphere[0].material.albedo = sphere[0].color;

	sphere[1].radius = 1.0;
	// sphere[1].position = vec3(2.0, 0.0, cos(t * 0.666));
	sphere[1].position = vec3(2.0, 0.0, 0.0);
	sphere[1].color = vec3(0.0, 1.0, 0.0);
	sphere[1].material.type = MAT_METAL;
	sphere[1].material.albedo = sphere[1].color;
	sphere[1].material.fuzz = 0.3;

	sphere[2].radius = 1.5;
	// sphere[2].position = vec3(-2.0, 0.5, cos(t * 0.333));
	sphere[2].position = vec3(-2.0, 0.5, 1.0);
	sphere[2].color = vec3(0.5137, 0.4941, 0.4941);
	sphere[2].material.type = MAT_DIELECTRIC;
	sphere[2].material.albedo = sphere[2].color;
	sphere[2].material.ref_idx = 1.5;

	// plane init
	plane.position = vec3(0.0, -1.0, 0.0);
	plane.normal = vec3(0.0, 1.0, 0.0);
	plane.color = vec3(0.5);
	plane.material.albedo = plane.color;

	vec3 col = vec3(0.0);
	for (int sample = 0; sample < SAMPLES_PER_PIXEL; sample++) {
		vec2 offset = sample_square() / min(r.x, r.y);
		ray.direction = normalize(vec3(p + offset, -1.0));
		col += ray_color(ray) / float(SAMPLES_PER_PIXEL);
	}
	gl_FragColor = vec4(sqrt(col), 1.0);
  }
