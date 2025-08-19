precision highp float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform sampler3D uLUT3D;
uniform float uLUTSize;

vec3 sampleLUT(vec3 rgb) {
  return texture(uLUT3D, clamp(rgb, 0.0, 1.0)).rgb;
}

void main() {
  vec3 rgb = texture2D(uSource, vUv).rgb;
  gl_FragColor = vec4(sampleLUT(rgb), 1.0);
}
