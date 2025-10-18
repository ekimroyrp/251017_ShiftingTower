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
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#f4f4f8");
scene.fog = new THREE.Fog(0xf4f4f8, 120, 320);

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
keyLight.castShadow = false;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffbfd7, 0.35);
fillLight.position.set(-120, 100, -80);
scene.add(fillLight);

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
  rotationJitter: 0.35,
  taper: 0.38,
  gradientBottom: "#ff6d9a",
  gradientTop: "#8f7bff",
  autoRotate: true,
  rotationSpeed: 0.12
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
towerMesh.castShadow = false;
towerMesh.receiveShadow = false;
towerGroup.add(towerMesh);

let needsRegeneration = true;

const regenerateTower = () => {
  const geometry = buildTowerGeometry(params);
  towerMesh.geometry.dispose();
  towerMesh.geometry = geometry;
  const bbox = geometry.boundingBox;
  if (bbox) {
    const centerY = (bbox.max.y + bbox.min.y) * 0.5;
    controls.target.set(0, centerY, 0);
  }
  needsRegeneration = false;
};

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

const presentationFolder = gui.addFolder("Presentation");
presentationFolder
  .add(params, "autoRotate")
  .name("Auto Rotate");
presentationFolder
  .add(params, "rotationSpeed", 0, 0.6, 0.01)
  .name("Rotation Speed");

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
