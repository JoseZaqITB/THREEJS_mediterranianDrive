#include ../includes/perlinNoise2D.glsl
uniform float uTime;
void main() {
    vec3 newPosition = csm_Position;
    /* vec2 windOffset = vec2(cnoise(uv * 0.01 + uTime * 0.015), cnoise(uv * 6.0 + uTime * 0.15));
    windOffset.x *= pow(uv.y, 10.0) * 10.0;
    newPosition.xz += windOffset; */

    csm_Position = newPosition;
    // varying 
}