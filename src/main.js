import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "lil-gui";
import { buildTowerGeometry } from "./towerGenerator.js";

const container = document.getElementById("app");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const fog = new THREE.FogExp2(0xf4f4f8, 0.02);
scene.fog = fog;

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(110, 130, 150);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 45, 0);
controls.update();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd1d5db, 0.75);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
keyLight.position.set(140, 200, 120);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 10;
keyLight.shadow.camera.far = 600;
keyLight.shadow.camera.left = -200;
keyLight.shadow.camera.right = 200;
keyLight.shadow.camera.top = 200;
keyLight.shadow.camera.bottom = -200;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffbfd7, 0.35);
fillLight.position.set(-120, 100, -80);
scene.add(fillLight);

const backLight = new THREE.DirectionalLight(0xd8e3ff, 0.4);
backLight.position.set(-80, 160, -60);
scene.add(backLight);

const lightingPresets = {
  "Studio Soft": {
    hemi: { color: 0xffffff, groundColor: 0xd1d5db, intensity: 0.75 },
    key: { color: 0xffffff, intensity: 1.1, position: [140, 200, 120] },
    fill: { color: 0xffbfd7, intensity: 0.35, position: [-120, 100, -80] },
    back: { color: 0xd8e3ff, intensity: 0.4, position: [-80, 160, -60] }
  },
  "Sunset Warm": {
    hemi: { color: 0xfff3e0, groundColor: 0xffd2b6, intensity: 0.6 },
    key: { color: 0xffbb73, intensity: 1.25, position: [180, 150, 40] },
    fill: { color: 0xff88aa, intensity: 0.45, position: [-160, 90, -100] },
    back: { color: 0xffe5c3, intensity: 0.35, position: [-40, 200, 160] }
  },
  "Cool Overcast": {
    hemi: { color: 0xe2f0ff, groundColor: 0xbdd3ff, intensity: 0.9 },
    key: { color: 0xcadfff, intensity: 0.85, position: [90, 220, 140] },
    fill: { color: 0x91a8ff, intensity: 0.65, position: [-180, 120, 30] },
    back: { color: 0xffffff, intensity: 0.25, position: [60, 200, -140] }
  },
  "Night Neon": {
    hemi: { color: 0x2d2d3a, groundColor: 0x1c142e, intensity: 0.4 },
    key: { color: 0x7a5fff, intensity: 1.6, position: [80, 120, 160] },
    fill: { color: 0xff3fa4, intensity: 0.9, position: [-140, 80, -40] },
    back: { color: 0x69f0ff, intensity: 0.6, position: [0, 200, -160] }
  },
  "Gallery Neutral": {
    hemi: { color: 0xfefefe, groundColor: 0xe6ecf2, intensity: 0.8 },
    key: { color: 0xffffff, intensity: 1.4, position: [160, 240, 60] },
    fill: { color: 0xf0f6ff, intensity: 0.55, position: [-200, 160, -40] },
    back: { color: 0xffffff, intensity: 0.35, position: [20, 260, -120] }
  }
};

const grid = new THREE.GridHelper(1000, 200, 0xdedee7, 0xdedee7);
grid.material.opacity = 0.35;
grid.material.transparent = true;
grid.material.depthWrite = false;
grid.renderOrder = -1;
scene.add(grid);

const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.25 });
shadowMaterial.depthWrite = false;
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  shadowMaterial
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0;
shadowPlane.receiveShadow = true;
shadowPlane.renderOrder = -2;
scene.add(shadowPlane);

const params = {
  seed: 1337,
  slabCount: 60,
  totalHeight: 160,
  baseWidth: 70,
  baseDepth: 70,
  slabThickness: 1.5,
  thicknessVariance: 0.6,
  widthVariance: 0.55,
  depthVariance: 0.55,
  subSlabMin: 1,
  subSlabMax: 5,
  subSlabScale: 0.45,
  shiftAmplitude: 18,
  verticalJitter: 0.18,
  rotationJitter: 0,
  taper: 0.38,
  gradientBottom: "#ff6d9a",
  gradientTop: "#8f7bff",
  backgroundColor: "#0f1016",
  autoRotate: false,
  rotationSpeed: 0.12,
  fogIntensity: 0.003,
  shadowsEnabled: true,
  sceneLighting: "Studio Soft"
};

const updateBackground = () => {
  const bgColor = new THREE.Color(params.backgroundColor);
  scene.background = bgColor;
  if (scene.fog) {
    scene.fog.color.copy(bgColor);
  }
};

const updateFog = () => {
  if (params.fogIntensity > 0) {
    fog.density = params.fogIntensity;
    fog.color.set(params.backgroundColor);
    scene.fog = fog;
  } else {
    scene.fog = null;
  }
  renderer.render(scene, camera);
};

const updateShadows = () => {
  renderer.shadowMap.enabled = params.shadowsEnabled;
  keyLight.castShadow = params.shadowsEnabled;
  shadowPlane.visible = params.shadowsEnabled;
  towerMesh.castShadow = params.shadowsEnabled;
  renderer.render(scene, camera);
};

const applySceneLighting = (presetName) => {
  const preset =
    lightingPresets[presetName] || lightingPresets["Studio Soft"];
  const { hemi, key, fill, back } = preset;
  hemiLight.color.setHex(hemi.color);
  hemiLight.groundColor.setHex(hemi.groundColor);
  hemiLight.intensity = hemi.intensity;

  keyLight.color.setHex(key.color);
  keyLight.intensity = key.intensity;
  keyLight.position.set(...key.position);

  fillLight.color.setHex(fill.color);
  fillLight.intensity = fill.intensity;
  fillLight.position.set(...fill.position);

  backLight.color.setHex(back.color);
  backLight.intensity = back.intensity;
  backLight.position.set(...back.position);

  renderer.render(scene, camera);
};

const towerMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.55,
  metalness: 0.05,
  flatShading: true
});

const towerGroup = new THREE.Group();
scene.add(towerGroup);

const towerMesh = new THREE.Mesh(new THREE.BufferGeometry(), towerMaterial);
towerMesh.castShadow = true;
towerMesh.receiveShadow = false;
towerGroup.add(towerMesh);

let needsRegeneration = true;

const regenerateTower = () => {
  const geometry = buildTowerGeometry(params);
  towerMesh.geometry.dispose();
  towerMesh.geometry = geometry;
  const bbox = geometry.boundingBox;
  if (bbox) {
    const baseOffset = -bbox.min.y + 0.01;
    towerGroup.position.y = baseOffset;
    const centerY = (bbox.max.y + bbox.min.y) * 0.5 + towerGroup.position.y;
    controls.target.set(0, centerY, 0);
  } else {
    towerGroup.position.y = 0;
  }
  needsRegeneration = false;
};

updateBackground();
updateFog();
updateShadows();
applySceneLighting(params.sceneLighting);

const gui = new GUI();

const towerFolder = gui.addFolder("Tower");
towerFolder
  .add(params, "slabCount", 10, 200, 1)
  .name("Slabs")
  .onFinishChange(() => {
    params.slabCount = Math.max(1, Math.floor(params.slabCount));
    needsRegeneration = true;
  });
towerFolder
  .add(params, "totalHeight", 40, 300, 1)
  .name("Height")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
towerFolder
  .add(params, "taper", 0, 0.9, 0.01)
  .name("Taper")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
towerFolder
  .add(params, "seed", 1, 99999, 1)
  .name("Seed")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
towerFolder.open();

const footprintFolder = gui.addFolder("Footprint");
footprintFolder
  .add(params, "baseWidth", 10, 120, 1)
  .name("Base Width")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
footprintFolder
  .add(params, "baseDepth", 10, 120, 1)
  .name("Base Depth")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
footprintFolder
  .add(params, "widthVariance", 0, 1.5, 0.01)
  .name("Width Var.")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
footprintFolder
  .add(params, "depthVariance", 0, 1.5, 0.01)
  .name("Depth Var.")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
footprintFolder
  .add(params, "shiftAmplitude", 0, 50, 1)
  .name("Shift")
  .onFinishChange(() => {
    needsRegeneration = true;
  });

const layeringFolder = gui.addFolder("Layering");
layeringFolder
  .add(params, "slabThickness", 0.1, 4, 0.05)
  .name("Thickness")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
layeringFolder
  .add(params, "thicknessVariance", 0, 1, 0.01)
  .name("Thickness Var.")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
layeringFolder
  .add(params, "subSlabMin", 1, 8, 1)
  .name("Min Plates")
  .onFinishChange(() => {
    params.subSlabMin = Math.min(params.subSlabMin, params.subSlabMax);
    needsRegeneration = true;
  });
layeringFolder
  .add(params, "subSlabMax", 1, 12, 1)
  .name("Max Plates")
  .onFinishChange(() => {
    params.subSlabMax = Math.max(params.subSlabMax, params.subSlabMin);
    needsRegeneration = true;
  });
layeringFolder
  .add(params, "subSlabScale", 0.1, 1, 0.01)
  .name("Plate Scale")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
layeringFolder
  .add(params, "verticalJitter", 0, 0.5, 0.01)
  .name("Vertical Jitter")
  .onFinishChange(() => {
    needsRegeneration = true;
  });
layeringFolder
  .add(params, "rotationJitter", 0, Math.PI / 2, 0.01)
  .name("Rotation Jitter")
  .onFinishChange(() => {
    needsRegeneration = true;
  });

const colorFolder = gui.addFolder("Color");
colorFolder
  .addColor(params, "gradientBottom")
  .name("Bottom")
  .onChange(() => {
    needsRegeneration = true;
  });
colorFolder
  .addColor(params, "gradientTop")
  .name("Top")
  .onChange(() => {
    needsRegeneration = true;
  });
colorFolder
  .addColor(params, "backgroundColor")
  .name("Background")
  .onChange(() => {
    updateBackground();
  });

const presentationFolder = gui.addFolder("Presentation");
presentationFolder
  .add(params, "autoRotate")
  .name("Auto Rotate");
presentationFolder
  .add(params, "rotationSpeed", 0, 0.6, 0.01)
  .name("Rotation Speed");
presentationFolder
  .add(params, "fogIntensity", 0, 0.08, 0.001)
  .name("Fog")
  .onChange(() => {
    updateFog();
  });
presentationFolder
  .add(params, "shadowsEnabled")
  .name("Shadows")
  .onChange(() => {
    updateShadows();
  });
presentationFolder
  .add(params, "sceneLighting", Object.keys(lightingPresets))
  .name("Scene Lighting")
  .onChange((value) => {
    applySceneLighting(value);
  });

gui.add(
  {
    randomizeSeed: () => {
      params.seed = Math.floor(Math.random() * 100000);
      gui.updateDisplay();
      needsRegeneration = true;
    }
  },
  "randomizeSeed"
).name("Randomize");

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTimestamp = 0;

const animate = (timestamp = 0) => {
  requestAnimationFrame(animate);
  const delta = (timestamp - lastTimestamp) / 1000 || 0;
  lastTimestamp = timestamp;

  if (needsRegeneration) {
    regenerateTower();
  }

  if (params.autoRotate) {
    towerGroup.rotation.y += delta * params.rotationSpeed;
  }

  controls.update();
  renderer.render(scene, camera);
};

regenerateTower();
animate();
