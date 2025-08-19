// lib/luts.js
import * as THREE from 'three';
import { LUTCubeLoader } from 'three/addons/loaders/LUTCubeLoader.js';

export async function loadCubeLUT(url) {
  const loader = new LUTCubeLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}
