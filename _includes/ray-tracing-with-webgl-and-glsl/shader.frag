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
  const int MAX_REF = 50;

  // ============================================================
  // [2] 構造体定義
  // ============================================================
  struct Ray{
	vec3 origin;
	vec3 direction;
  };

  struct Sphere{
	float radius;
	vec3  position;
	vec3  color;
  };

  struct Plane{
	vec3 position;
	vec3 normal;
	vec3 color;
  };

  struct Intersection{
	int hit;
	vec3 hitPoint; // 交点の座標
	vec3 normal;   // 交点位置の法線
	vec3 color;    // 交点位置の色
	float distance;
	vec3 rayDir;
  };

  Sphere sphere[3];
  Plane plane;

  // ============================================================
  // [3] 疑似乱数関数
  // ============================================================
  vec2 randSeed;

  float random() {
	randSeed += vec2(1.0, -1.0);
	return fract(sin(dot(randSeed, vec2(12.9898, 78.233))) * 43758.5453);
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

  vec3 random_in_unit_sphere() {
	// GLSLでは無限ループは怒られるので有限回にしている
	// 100回やっとけばまず失敗しない
	for(int i = 0; i < 100; i++) {
		vec3 p = random_vec3(-1.0, 1.0);
		if (dot(p, p) >= 1.0) continue;
		return p;
	}
  }

  // ============================================================
  // [4] マテリアル散乱関数
  // ============================================================
  // TODO: Step 2〜6 で実装

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
	}
  }

  void intersectExec(Ray R, inout Intersection I){
	intersectSphere(R, sphere[0], I);
	intersectSphere(R, sphere[1], I);
	intersectSphere(R, sphere[2], I);
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
			tempColor *= 0.5;
			ray.origin = its.hitPoint + its.normal * EPS;
			ray.direction = its.normal + random_in_unit_sphere();
		} else {
			vec3 unit_direction = normalize(ray.direction);
			float t = 0.5 * (unit_direction.y + 1.0);
			return (1.0 - t) * vec3(1.0) + t * vec3(0.5, 0.7, 1.0);
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
	sphere[0].position = vec3(0.0, -0.5, sin(t));
	sphere[0].color = vec3(1.0, 1.0, 0.0);
	sphere[1].radius = 1.0;
	sphere[1].position = vec3(2.0, 0.0, cos(t * 0.666));
	sphere[1].color = vec3(0.0, 1.0, 0.0);
	sphere[2].radius = 1.5;
	sphere[2].position = vec3(-2.0, 0.5, cos(t * 0.333));
	sphere[2].color = vec3(1.0, 1.0, 1.0);

	// plane init
	plane.position = vec3(0.0, -1.0, 0.0);
	plane.normal = vec3(0.0, 1.0, 0.0);
	plane.color = vec3(1.0);

	vec3 col = ray_color(ray);
	gl_FragColor = vec4(sqrt(col), 1.0);
  }
