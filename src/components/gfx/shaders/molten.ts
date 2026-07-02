/**
 * "Molten" — a wet glaze surface, mid-melt.
 *
 * Domain-warped fbm drives a banded palette so the four glaze colors "break"
 * over each other the way glaze breaks on a rim; a bright meniscus line traces
 * each band edge, and a fake-normal specular gives the wet-glass sheen. The
 * pointer injects a local warp bump — stirring the bucket.
 */
export const MOLTEN_FRAG = /* glsl */ `
precision highp float;

uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_pointer; /* 0..1, y up */
uniform float u_scroll;  /* 0..1 */
uniform vec3  u_colors[4];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.31;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  p *= 2.1;

  float t = u_time * 0.055;

  /* pointer bump — a local stir in the bucket */
  vec2 pp = u_pointer;
  pp.x *= u_res.x / u_res.y;
  vec2 pd = p - pp * 2.1;
  float stir = exp(-dot(pd, pd) * 5.0);

  /* two rounds of domain warping */
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + t),
    fbm(p + vec2(3.7, 9.2) - t * 0.6)
  );
  vec2 r = vec2(
    fbm(p + q * 1.7 + vec2(1.2, 6.9) + stir * 0.8),
    fbm(p + q * 1.5 + vec2(8.3, 2.8) - t * 0.35)
  );
  float n = fbm(p + r * 1.9);

  /* glaze bands — colors break over each other, drift slightly with scroll */
  float band = n + u_scroll * 0.12 + stir * 0.10;
  vec3 col = u_colors[0];
  col = mix(col, u_colors[1], smoothstep(0.28, 0.45, band));
  col = mix(col, u_colors[2], smoothstep(0.45, 0.60, band));
  col = mix(col, u_colors[3], smoothstep(0.60, 0.78, band));

  /* meniscus — a bright wet line where bands meet */
  float m = 0.0;
  m += 1.0 - smoothstep(0.0, 0.014, abs(band - 0.45));
  m += 1.0 - smoothstep(0.0, 0.014, abs(band - 0.60));
  col += m * 0.16 * vec3(1.0, 0.96, 0.86);

  /* fake normal from the height field → wet-glass specular */
  float e = 0.035;
  float nx = fbm(p + r * 1.9 + vec2(e, 0.0));
  float ny = fbm(p + r * 1.9 + vec2(0.0, e));
  vec3 nrm = normalize(vec3((n - nx) / e, (n - ny) / e, 2.4));
  vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
  float spec = pow(max(dot(reflect(-lightDir, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 26.0);
  col += spec * 0.20;

  /* gentle vignette keeps the pool feeling contained */
  vec2 v = uv - 0.5;
  col *= 1.0 - 0.22 * dot(v, v) * 2.0;

  gl_FragColor = vec4(col, 1.0);
}
`;
