varying vec2 vUv;
uniform float uTime;

#include ../includes/perlinNoise2D.glsl
void main() {
    float alpha = cnoise(vUv * 6.0 + uTime * 0.15);

    float alphaBorders = 1.0 - length( pow( vUv - 0.5, vec2(2.0) ) * 30.0);
    alphaBorders = smoothstep(0.0,0.9, alphaBorders);

    alpha *= alphaBorders;

    // final color
    gl_FragColor = vec4(vec3(1.0), alpha);
}