import * as THREE from 'three';
import { loadCubeLUT } from './lib/luts.js';
import fragShader from './shaders/lut.frag.glsl?raw';


// ... rest of your code stays the same


const fileInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('downloadBtn');

let lut;
let renderer, scene, camera, material;

loadCubeLUT('/luts/ABB EB ANNA HR 6.CUBE').then((result) => {
    lut = result;
    console.log("✅ LUT loaded");
});

fileInput.addEventListener('change', async (e) => {
    if (!e.target.files[0] || !lut) return;

    const img = await createImageBitmap(e.target.files[0]);
    const { width, height } = img;
    canvas.width = width;
    canvas.height = height;

    renderer = new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true });
    renderer.setSize(width, height);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    // 🔥 Invert Y axis in UVs to fix upside-down rendering
    geometry.faceVertexUvs = [[
        [new THREE.Vector2(0, 1), new THREE.Vector2(1, 1), new THREE.Vector2(0, 0)],
        [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0)]
    ]];

    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    texture.flipY = false; // keep false since we are fixing UVs

    const uniforms = {
        uSource: { value: texture },
        uLUT3D: { value: lut.texture3D },
        uLUTSize: { value: lut.size }
    };

    material = new THREE.ShaderMaterial({
        uniforms,
        fragmentShader: fragShader,
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = vec2(uv.x, 1.0 - uv.y);
        gl_Position = vec4(position, 1.0);
      }`
    });

    scene.add(new THREE.Mesh(geometry, material));
    renderer.render(scene, camera);
});

// ✅ Download graded image
downloadBtn.addEventListener('click', () => {
    if (!renderer) return;
    const link = document.createElement('a');
    link.download = 'graded-image.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
});
