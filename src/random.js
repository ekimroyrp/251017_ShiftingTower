const UINT32_MAX = 0xffffffff;

const createHasher = () => {
  let h = 0x811c9dc5;
  return (value) => {
    h ^= value;
    h = Math.imul(h, 0x01000193);
    h >>>= 0;
    return h;
  };
};

const stringToSeed = (input) => {
  if (typeof input !== "string") {
    return 0;
  }
  const hashWord = createHasher();
  for (let i = 0; i < input.length; i += 1) {
    hashWord(input.charCodeAt(i));
  }
  return hashWord(input.length);
};

const normalizeSeed = (seed) => {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return (seed >>> 0) || 1;
  }
  return stringToSeed(String(seed)) || 1;
};

export const createRng = (seed) => {
  let t = normalizeSeed(seed);
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / (UINT32_MAX + 1);
  };
};

export const range = (rng, min, max) => min + rng() * (max - min);

export const pickInt = (rng, min, max) =>
  Math.floor(range(rng, min, max + 1));
