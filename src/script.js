import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/noise/vertex.glsl";
import fragmentShader from "./shaders/noise/fragment.glsl";
import grassVertexShader from "./shaders/grass/vertex.glsl";
import grassFragmentShader from "./shaders/grass/fragment.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { gsap } from "gsap";

/**
 * Base
 */
const gltfLoader = new GLTFLoader();
// Debug
const gui = new GUI();
const debugObject = {
  colorA: "#042c71",
  colorB: "#f87865",
  colorGrass: "#9bbc49",
  lightPosition: new THREE.Vector3(1, 1, 1),
};
// Canvas
const canvas = document.querySelector("canvas.webgl");

/**
 * Scene
 *   */
const scene = new THREE.Scene();

// hdr
const rgbeLoader = new RGBELoader();
rgbeLoader.load("./hdri/cartoonEnviroment_hdr.hdr", (envMap) => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = envMap;
  scene.environment = envMap;

  // rotate hdr
  scene.backgroundRotation.set(0, Math.PI * 0.5, 0);
  scene.environmentRotation.set(0, Math.PI * 0.5, 0);

  // light intensity
  scene.environmentIntensity = 1;
});

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const floorAlphaTxt = textureLoader.load("./floor/alpha.jpg");

// gradients
const gradientTexture = textureLoader.load("./gradients/5.jpg");
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
camera.position.y = 1;
scene.add(camera);

/**
 * Mesh
 */
let noiseMaterial = null;
const loadPlaneNoise = () => {
  // Geometry
  const geometry = new THREE.PlaneGeometry(20, 5);
  // Material

  const uniforms = {
    uColorA: new THREE.Uniform(new THREE.Color(debugObject.colorA)),
    uColorB: new THREE.Uniform(new THREE.Color(debugObject.colorB)),
    uTime: new THREE.Uniform(0),
    uAlpha: new THREE.Uniform(1),
    uVanish: new THREE.Uniform(0.2),
    uNoiseFrequency: new THREE.Uniform(500),
  };
  noiseMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });
  // guis
  gui.addColor(debugObject, "colorA").onChange(() => {
    uniforms.uColorA.value = new THREE.Color(debugObject.colorA);
  });
  gui.addColor(debugObject, "colorB").onChange(() => {
    uniforms.uColorB.value = new THREE.Color(debugObject.colorB);
  });

  gui
    .add(noiseMaterial.uniforms.uVanish, "value")
    .min(0.01)
    .max(1)
    .name("uVanish");
  gui
    .add(noiseMaterial.uniforms.uNoiseFrequency, "value")
    .min(1)
    .max(1000)
    .name("uNoiseFrequency");
  // Mesh
  const mesh = new THREE.Mesh(geometry, noiseMaterial);
  mesh.position.z = -1;
  camera.add(mesh);

  // fade and remove animation
  const destroyDiv = () => {
    document.body.removeChild(div);
  };
  const destroyMesh = () => {
    camera.remove(mesh);
    geometry.dispose();
    noiseMaterial.dispose();
  };
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.width = `${sizes.width}px`;
  div.style.height = `${sizes.height}px`;
  div.style.backgroundColor = "#4b241eff";

  document.body.append(div);

  gsap
    .fromTo(
      div.style,
      { backgroundColor: "#4b241eff", duration: 1 },
      { backgroundColor: "#4b241e00", duration: 3, onComplete: destroyDiv }
    )
    .then(() =>
      gsap.to(noiseMaterial.uniforms.uAlpha, {
        value: 0,
        duration: 5,
        ease: "linear",
        onComplete: destroyMesh,
      })
    );
};

// loadPlaneNoise(); // OJOOO: activate later

// baseMontain

const baseMontainGeometry = new THREE.CircleGeometry(20, 8, 0, Math.PI);
baseMontainGeometry.rotateX(-Math.PI * 0.5);
const baseMontainMaterial = new THREE.ShaderMaterial({
  vertexShader: grassVertexShader,
  fragmentShader: grassFragmentShader,
  uniforms: {
    uGradients: new THREE.Uniform(3),
    uLightPosition: new THREE.Uniform(debugObject.lightPosition),
    uColor: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
    uDecay: new THREE.Uniform(3.0),
  },
  transparent: true,
});
const baseMontainCircle = new THREE.Mesh(
  baseMontainGeometry,
  baseMontainMaterial
);
// position
baseMontainCircle.position.z = 3;

// shadow
baseMontainCircle.receiveShadow = true;
scene.add(baseMontainCircle);

// tweaks
gui.add(baseMontainMaterial.uniforms.uDecay, "value", 0, 10, 1).name("uDecay");

// bath mesh
gltfLoader.load("./bath.glb", (gltf) => {
  const testMesh = gltf.scene.children[0];
  testMesh.scale.set(0.05, 0.05, 0.05);
  testMesh.castShadow = true;
  testMesh.receiveShadow = true;
  scene.add(testMesh);
});

/**
 * Lights
 */
const AmbientLight = new THREE.AmbientLight(debugObject.colorGrass, 1);
scene.add(AmbientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
directionalLight.position.set(6.25, 3, -4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update shaders
  // Update controls
  controls.update();
  // update material
  if (noiseMaterial) noiseMaterial.uniforms.uTime.value = elapsedTime;
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
