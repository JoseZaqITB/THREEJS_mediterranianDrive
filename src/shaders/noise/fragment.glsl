uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uAlpha;
uniform float uNoiseFrequency;
uniform float uVanish;
varying vec2 vUv;


#include ../includes/simplexNoise2D.glsl

void main()
{
    // make noise
    float noise = snoise(vUv * uNoiseFrequency);
    noise = step( uTime * uVanish, noise);
    vec3 colorMix = mix(uColorA, uColorB, noise);
    // add color
    gl_FragColor = vec4(colorMix,uAlpha);
} 