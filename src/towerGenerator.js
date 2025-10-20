import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createRng, range, pickInt } from "./random.js";

const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const unitScale = new THREE.Vector3(1, 1, 1);

const clampPositive = (value, fallback) =>
  Number.isFinite(value) && value > 0 ? value : fallback;

export const buildTowerGeometry = (params) => {
  const {
    seed,
    slabCount,
    totalHeight,
    baseWidth,
    baseDepth,
    slabThickness,
    thicknessVariance,
    widthVariance,
    depthVariance,
    subSlabMin,
    subSlabMax,
    subSlabScale,
    slabCopies,
    shiftAmplitude,
    verticalJitter,
    rotationJitter,
    taper,
    gradientBottom,
    gradientTop
  } = params;

  const rng = createRng(seed);
  const bottomColor = new THREE.Color(gradientBottom);
  const topColor = new THREE.Color(gradientTop);

  const geometries = [];
  const slabs = [];
  const heightStep = slabCount > 1 ? totalHeight / (slabCount - 1) : totalHeight;
  const baseThickness = clampPositive(slabThickness, 0.2);
  const taperClamp = THREE.MathUtils.clamp(taper, 0, 0.95);

  for (let level = 0; level < slabCount; level += 1) {
    const levelT = slabCount > 1 ? level / (slabCount - 1) : 0;
    const gradientColor = bottomColor.clone().lerp(topColor, levelT);
    const yOffset =
      -totalHeight / 2 +
      heightStep * level +
      range(rng, -verticalJitter, verticalJitter) * heightStep;

    const taperFactor = 1 - taperClamp * levelT;
    const slabQuantity = Math.max(1, pickInt(rng, subSlabMin, subSlabMax));

    for (let s = 0; s < slabQuantity; s += 1) {
      const plateScale = range(rng, subSlabScale, 1);
      const widthScale =
        taperFactor *
        (1 + (rng() * 2 - 1) * widthVariance) *
        plateScale;
      const depthScale =
        taperFactor *
        (1 + (rng() * 2 - 1) * depthVariance) *
        plateScale;

      const width = clampPositive(baseWidth * widthScale, 0.75);
      const depth = clampPositive(baseDepth * depthScale, 0.75);
      const thicknessVariation =
        baseThickness * (1 + (rng() * 2 - 1) * thicknessVariance);
      const actualThickness = clampPositive(
        thicknessVariation,
        baseThickness * 0.25
      );

      const offsetX = (rng() * 2 - 1) * shiftAmplitude * (1 - levelT * 0.25);
      const offsetZ = (rng() * 2 - 1) * shiftAmplitude * (1 - levelT * 0.25);
      const rotationY = (rng() * 2 - 1) * rotationJitter;

      const geometry = new THREE.BoxGeometry(width, actualThickness, depth);

      const { count } = geometry.attributes.position;
      const colorArray = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        colorArray[i * 3] = gradientColor.r;
        colorArray[i * 3 + 1] = gradientColor.g;
        colorArray[i * 3 + 2] = gradientColor.b;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

      tempPosition.set(offsetX, yOffset, offsetZ);
      tempQuaternion.setFromAxisAngle(
        THREE.Object3D.DEFAULT_UP,
        rotationY
      );
      tempMatrix.compose(tempPosition, tempQuaternion, unitScale);
      geometry.applyMatrix4(tempMatrix);

      const colorHex = gradientColor.getHex();

      geometries.push(geometry);
      slabs.push({
        width,
        depth,
        height: actualThickness,
        position: { x: offsetX, y: yOffset, z: offsetZ },
        rotationY,
        color: colorHex
      });

      if (slabCopies > 0) {
        for (let copyIndex = 1; copyIndex <= slabCopies; copyIndex += 1) {
          const copyGeometry = geometry.clone();
          copyGeometry.translate(0, actualThickness * copyIndex, 0);
          geometries.push(copyGeometry);
          slabs.push({
            width,
            depth,
            height: actualThickness,
            position: {
              x: offsetX,
              y: yOffset + actualThickness * copyIndex,
              z: offsetZ
            },
            rotationY,
            color: colorHex
          });
        }
      }
    }
  }

  if (geometries.length === 0) {
    return new THREE.BufferGeometry();
  }

  const merged = mergeGeometries(geometries, false);
  geometries.forEach((geo) => geo.dispose());

  merged.computeBoundingBox();
  merged.computeBoundingSphere();

  return { geometry: merged, slabs };
};
