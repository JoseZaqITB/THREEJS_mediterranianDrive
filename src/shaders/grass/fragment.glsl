uniform vec2 uLightPosition;
uniform vec2 uMoonPosition;
uniform float uGradients;
uniform vec3 uColor;
uniform float uStrenght;
uniform float uDecay;
uniform float uRockFrequency;
uniform vec3 uRockColor;
uniform vec3 uColorLight;



varying vec2 vUv;

#include ../includes/simplexNoise2D.glsl

vec3 toonLight(vec3 initialColor,vec3 lightColor, vec2 XYPosition, float strenght, float  decay, float gradients, vec2 uv) {
    gradients = gradients - 1.0;
     float colorStrenght = 1.0 - pow(distance(uv, XYPosition), decay);
    colorStrenght = round(colorStrenght * gradients ) / gradients;
    colorStrenght = (colorStrenght + strenght) / (strenght + 1.0);
    return min(vec3(1.0), (initialColor  + lightColor * colorStrenght )* 0.5);
}

void main() {
    vec3 color = uColor;
    // random rocks
    float mixer = snoise(vUv * uRockFrequency);
    mixer = step(0.9, mixer);
    color = mix(color, uRockColor, mixer);
    // light toon simulation
    color = toonLight(color,uColor, uMoonPosition, uStrenght, uDecay, uGradients, vUv);
    color = toonLight(color,uColorLight, uLightPosition, uStrenght, uDecay, uGradients, vUv);
    
    // alpha 
    float alpha =distance(vUv,vec2(0.5));
    alpha = 1.0 - smoothstep(0.45, 0.5, alpha);
    //
    gl_FragColor = vec4(color,alpha);
}