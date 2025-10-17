uniform vec2 uLightPosition;
uniform float uGradients;
uniform vec3 uColor;
uniform float uStrenght;
uniform float uDecay;

varying vec2 vUv;

void main() {
    // light toon simulation
    float gradients = uGradients - 1.0;
     float strenght = 1.0 - pow(distance(vUv, uLightPosition), uDecay);
    strenght = round(strenght * gradients ) / gradients;
    strenght = (strenght + uStrenght) / (uStrenght + 1.0);
    // final color
    vec3 color = uColor * strenght;
    // alpha 
    float alpha =distance(vUv,vec2(0.5));
    alpha = 1.0 - smoothstep(0.45, 0.5, alpha);
    //
    gl_FragColor = vec4(color,alpha);
}