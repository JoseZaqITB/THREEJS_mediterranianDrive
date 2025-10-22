import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/noise/vertex.glsl";
import fragmentShader from "./shaders/noise/fragment.glsl";
import grassVertexShader from "./shaders/grass/vertex.glsl";
import grassFragmentShader from "./shaders/grass/fragment.glsl";
import skyVertexShader from "./shaders/sky/vertex.glsl";
import skyFragmentShader from "./shaders/sky/fragment.glsl";
import waterFragmentShader from "./shaders/water/water/fragment.glsl";
import waterVertexShader from "./shaders/water/water/vertex.glsl";
import cloudFragmentShader from "./shaders/cloud/fragment.glsl";
import cloudVertexShader from "./shaders/cloud/vertex.glsl";
import pointCarFragmentShader from "./shaders/pointCar/fragment.glsl";
import pointCarVertexShader from "./shaders/pointCar/vertex.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

import { gsap } from "gsap";

/**
 * Base
 */
const gltfLoader = new GLTFLoader();
const audioLoader = new THREE.AudioLoader();
// Debug
const gui = new GUI();
const debugObject = {
  colorA: "#042c71",
  colorB: "#f87865",
  uSkyColorA: "#042c71",
  uSkyColorB: "#000000",
  colorMoon: "#8b8b8b",
  colorRock: "#0c0c0c",
  colorLight: "#ce9324",
  lightPosition: new THREE.Vector2(0.0, 1.0),
  moonPosition: new THREE.Vector2(0.55, 1.0),
  depthColor: "#130057",
  surfaceColor: "#006602",
};
debugObject.uSkyColorA = debugObject.colorA;
// Canvas
const canvas = document.querySelector("canvas.webgl");

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const moonAlphaTxt = textureLoader.load("./moon/alpha.jpg");
moonAlphaTxt.colorSpace = THREE.SRGBColorSpace;

const gradientsTxt = textureLoader.load("./gradients/3.jpg");
gradientsTxt.colorSpace = THREE.SRGBColorSpace;
gradientsTxt.minFilter = THREE.NearestFilter;
gradientsTxt.magFilter = THREE.NearestFilter;

/**
 * Scene
 *   */
const scene = new THREE.Scene();

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
camera.position.z = 6;
camera.position.y = 4;
scene.add(camera);

// add audio listener
const listener = new THREE.AudioListener();
camera.add(listener);
/**
 * Audio
 */
const radioSound = new THREE.PositionalAudio(listener);
// load a page to wait
const p = document.createElement("p");
p.style.fontSize = "72px";
p.style.alignContent = "center";
p.style.textAlign = "center";
p.style.height = "100vh";
p.innerText = "LOADING...";
document.body.appendChild(p);
// load song
const loadedSongBuffer = await audioLoader.loadAsync("./audio/HenryNelson_TeExtranyare.mp3"); // OJO: just temp!!!
  radioSound.setBuffer(loadedSongBuffer);
  radioSound.setRefDistance(1); // distancia desde donde escuchar
  radioSound.setLoop(true);
  radioSound.setVolume(0.5);
  //radioSound.play(); play once user interact

  document.body.removeChild(p);
const onFirstInteraction = () => {
  radioSound.play();
  
  // eliminar listeners
  window.removeEventListener("touchstart", onFirstInteraction);
  window.removeEventListener("click", onFirstInteraction);

}

window.addEventListener("touchstart", onFirstInteraction, {once: true});
window.addEventListener("click", onFirstInteraction, {once: true});

/**
 * Mesh
 */
/**
 * Skybox
 */
const skyGeometry = new THREE.BoxGeometry(50, 50, 50);
const skyMaterial = new THREE.ShaderMaterial({
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
  side: THREE.BackSide,
  uniforms: {
    uSkyColorA: new THREE.Uniform(new THREE.Color(debugObject.uSkyColorA)),
    uSkyColorB: new THREE.Uniform(new THREE.Color(debugObject.uSkyColorB)),
  },
});

const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

/**
 * Noise
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

// car mesh
gltfLoader.load("./glbs/car.glb", (gltf) => {
  const materialMap = new Map();
  const carMaterial = new THREE.MeshToonMaterial({ gradientMap: gradientsTxt });
  const carToonMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshToonMaterial,
    vertexShader: pointCarVertexShader,
    fragmentShader: pointCarFragmentShader,
    vertexColors: true,
    // MATERIAL
    gradientMap: gradientsTxt,
  });

  gltf.scene.children.map((child) => {
    if (child.type === "Mesh") {
      // update material
      if (child.geometry.attributes.color) {
        child.material = carToonMaterial;
      } else {
        let childMaterial = child.material;
        if (!materialMap.has(childMaterial.name)) {
          materialMap.set(
            childMaterial.name,
            new THREE.MeshToonMaterial({
              color: childMaterial.color,
              map: childMaterial.map,
              gradientMap: gradientsTxt,
            })
          );
        }
        child.material = materialMap.get(childMaterial.name);
      }
      // add audio to radio
      if (child.name === "door_v2") {
        child.add(radioSound);
      }
    }
  });
  const car = gltf.scene;
  // settings
  car.position.set(-0.7, 2.5, 4.5);
  // shadows
  //car.castShadow = true;
  //car.receiveShadow = true;
  scene.add(car);
});

// palmera
gltfLoader.load("./glbs/palmera.glb", (gltf) => {


  const palmeraToonMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshToonMaterial,
    vertexShader: pointCarVertexShader,
    fragmentShader: pointCarFragmentShader,
    vertexColors: true,
    // MATERIAL
    gradientMap: gradientsTxt,
  });

  gltf.scene.children.map((child) => {
    if (child.type === "Mesh") {
       if (child.geometry.attributes.color) {
        child.material = palmeraToonMaterial;
      }
    }
  });

  const palmera = gltf.scene;
  // settings
  palmera.position.x = -8;
  palmera.position.z = -3.5;

  palmera.scale.y = 1.5;
  palmera.scale.x = 1.5;

  // material

  // shadows
  //palmera.castShadow = true;
  //palmera.receiveShadow = true;
  scene.add(palmera);
});

// barrera
gltfLoader.load("./glbs/barrera.glb", (gltf) => {
  const barreraMaterial = new THREE.MeshToonMaterial({
    color: "#ce9324",
    gradientMap: gradientsTxt,
    alphaMap: moonAlphaTxt,
    transparent: true,
  });

  const barrera = gltf.scene.children[0];

  // settings
  barrera.position.x = -2.5;
  barrera.position.y = 1;
  barrera.position.z = -8;
  barrera.scale.y = 1;

  // material
  barrera.material = barreraMaterial;
  // shadows
  //palmera.castShadow = true;
  //palmera.receiveShadow = true;
  scene.add(barrera);
});

// silla
gltfLoader.load("./glbs/silla.glb", (gltf) => {
  const sillaMaterial = new THREE.MeshToonMaterial({
    color: "#ce9324",
    gradientMap: gradientsTxt,
    transparent: true,
  });

  const silla = gltf.scene.children[0];

  // settings
  silla.position.x = -4;
  silla.position.y = 1.4;
  silla.position.z = -3.5;
  silla.scale.y = 1;

  // material
  silla.material = sillaMaterial;
  // shadows
  //palmera.castShadow = true;
  //palmera.receiveShadow = true;
  scene.add(silla);
});

/*
 * baseMontain
 */

const baseMontainGeometry = new THREE.CircleGeometry(20, 8, 0);
baseMontainGeometry.rotateX(-Math.PI * 0.5);
const baseMontainMaterial = new THREE.ShaderMaterial({
  vertexShader: grassVertexShader,
  fragmentShader: grassFragmentShader,
  uniforms: {
    uGradients: new THREE.Uniform(4),
    uLightPosition: new THREE.Uniform(debugObject.lightPosition),
    uMoonPosition: new THREE.Uniform(debugObject.moonPosition),
    uColor: new THREE.Uniform(new THREE.Color(debugObject.colorMoon)),
    uStrenght: new THREE.Uniform(0.0),
    uDecay: new THREE.Uniform(1.4),
    uRockFrequency: new THREE.Uniform(50),
    uRockColor: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
    uColorLight: new THREE.Uniform(new THREE.Color(debugObject.colorLight)),
  },
  transparent: true,
});
const baseMontainCircle = new THREE.Mesh(
  baseMontainGeometry,
  baseMontainMaterial
);
// position
baseMontainCircle.position.z = 10;

// shadow
//baseMontainCircle.receiveShadow = true;
scene.add(baseMontainCircle);

// tweaks
gui
  .add(baseMontainMaterial.uniforms.uStrenght, "value", 0, 10, 1)
  .name("uStrenght");
gui
  .add(baseMontainMaterial.uniforms.uGradients, "value", 2, 10, 1)
  .name("uGradients");
gui
  .add(baseMontainMaterial.uniforms.uDecay, "value", 0, 10, 0.1)
  .name("uDecay");
gui
  .add(baseMontainMaterial.uniforms.uRockFrequency, "value", 0, 100, 0.1)
  .name("uRockFrequency");

gui
  .addColor(debugObject, "colorRock")
  .onChange(
    () =>
      (baseMontainMaterial.uniforms.uRockColor.value = new THREE.Color(
        debugObject.colorRock
      ))
  );
gui
  .addColor(debugObject, "colorMoon")
  .onChange(
    () =>
      (baseMontainMaterial.uniforms.uColor.value = new THREE.Color(
        debugObject.colorMoon
      ))
  );
gui
  .addColor(debugObject, "colorLight")
  .onChange(
    () =>
      (baseMontainMaterial.uniforms.uColorLight.value = new THREE.Color(
        debugObject.colorLight
      ))
  );

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(20, 20, 512, 512);

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.036 },
    uBigWavesFrequency: { value: new THREE.Vector2(5.383, 1.98) },
    uBigWavesSpeed: { value: 0.854 },

    uSmallWavesElevation: { value: 0.4 },
    uSmallWavesFrequency: { value: 0.75 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 3 },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.376 },
    uColorMultiplier: { value: 1.052 },
  },
});

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
water.position.z = -18;
scene.add(water);

// debug
const waterTweak = gui.addFolder("Water");
waterTweak.addColor(debugObject, "depthColor").onChange(() => {
  waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
});
waterTweak.addColor(debugObject, "surfaceColor").onChange(() => {
  waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});

waterTweak
  .add(waterMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");
waterTweak
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");
waterTweak
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");
waterTweak
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uBigWavesSpeed");

waterTweak
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");
waterTweak
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(30)
  .step(0.001)
  .name("uSmallWavesFrequency");
waterTweak
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSmallWavesSpeed");
waterTweak
  .add(waterMaterial.uniforms.uSmallIterations, "value")
  .min(0)
  .max(5)
  .step(1)
  .name("uSmallIterations");

waterTweak
  .add(waterMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uColorOffset");
waterTweak
  .add(waterMaterial.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uColorMultiplier");

/**
 * Moon
 */

const moonGeometry = new THREE.CircleGeometry(0.75, 32);
const moonMaterial = new THREE.MeshBasicMaterial({
  color: "#ffffff",
  alphaMap: moonAlphaTxt,
  transparent: true,
});

const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(4, 10, -16);

scene.add(moon);

/**
 * Clouds
 */
const cloudGeometry = new THREE.PlaneGeometry(100,20, 1,1);
const cloudMaterial = new THREE.ShaderMaterial({
  vertexShader: cloudVertexShader,
  fragmentShader: cloudFragmentShader,
  transparent: true,
  uniforms: {
    uTime: new THREE.Uniform(0),
  }
})

const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
clouds.position.set(4,15,-19);
scene.add(clouds);



/**
 * Lights
 */
/* const AmbientLight = new THREE.AmbientLight(debugObject.colorMoon, 1);
scene.add(AmbientLight); */

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(0.6, 0.5, -1);
/* directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8; */
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(debugObject.colorLight, 3);
directionalLight2.position.set(-1, 1, -1);
/* directionalLight2.castShadow = true;
directionalLight2.shadow.mapSize.set(1024, 1024);
directionalLight2.shadow.camera.near = 0.1;
directionalLight2.shadow.camera.far = 30;
directionalLight2.shadow.camera.top = 8;
directionalLight2.shadow.camera.right = 8;
directionalLight2.shadow.camera.bottom = -8;
directionalLight2.shadow.camera.left = -8; */
scene.add(directionalLight2);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
/* renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; */
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * controls
 */
const control = new PointerLockControls(camera, renderer.domElement);

const forwardCameraDirection = new THREE.Vector3(0, 0, 0);
control.getDirection(forwardCameraDirection);

// rotation constraints
const MIN_Y_ANGLE = -Math.PI / 4; // -45 grados
const MAX_Y_ANGLE = Math.PI / 4; // +45 grados
let currentCameraAngle = {
  x: control.object.rotation.x,
  z: control.object.rotation.z,
};

// listeners
window.addEventListener("click", () => {
  if (!control.isLocked) {
    // enable controls
    control.lock();
  }
});
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update controls
  if (control.object.rotation.y >= MAX_Y_ANGLE) {
    control.object.rotation.set(
      currentCameraAngle.x,
      MAX_Y_ANGLE,
      currentCameraAngle.z
    );
    currentCameraAngle = {
      x: control.object.rotation.x,
      z: control.object.rotation.z,
    };
  } else if (control.object.rotation.y <= MIN_Y_ANGLE) {
    control.object.rotation.set(
      currentCameraAngle.x,
      MIN_Y_ANGLE,
      currentCameraAngle.z
    );
    currentCameraAngle = {
      x: control.object.rotation.x,
      z: control.object.rotation.z,
    };
  }
  // update shaders
  // update material
  if (noiseMaterial) noiseMaterial.uniforms.uTime.value = elapsedTime;
  // update water material
  waterMaterial.uniforms.uTime.value = elapsedTime;
  cloudMaterial.uniforms.uTime.value = elapsedTime;
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
