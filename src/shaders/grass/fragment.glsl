uniform vec2 uLightPosition;
uniform float uGradients;
uniform vec3 uColor;
uniform float uDecay;

varying vec2 vUv;

void main() {
    // light toon simulation
    float strenght = 1.0 - distance(vUv, uLightPosition) ;
    strenght = round(strenght * uGradients ) / uGradients;
    strenght = (strenght + uDecay) / (uDecay + 1.0);
    // final color
    vec3 color = uColor * strenght;
    gl_FragColor = vec4(color,1.0);
}