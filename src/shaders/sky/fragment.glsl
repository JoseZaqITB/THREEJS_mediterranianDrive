uniform vec3 uSkyColorA;
uniform vec3 uSkyColorB;

varying vec2 vUv;

void main() {
    float mixer = smoothstep(0.5, 1.0,vUv.y);
    vec3 color = mix(uSkyColorB, uSkyColorA, mixer);
    gl_FragColor = vec4(color,1.0);
}