import * as THREE from 'three';
import { loadCubeLUT } from './lib/luts.js';
import fragShader from './shaders/lut.frag.glsl?raw';




// LUT selection dropdown setup (auto-populate from all .CUBE files in public/luts)
const allLuts = [
    "ABB CRB 15000 New GoFa - 9-Large.CUBE",
    "ABB EB ANNA HR 6.CUBE",
    "ABB EB CLAIRE R&D 10-1.CUBE",
    "ABB EB TOBIAS HYDROPOWER 12-Large.CUBE",
    "AdobeStock_494126285-Large.CUBE",
    "download17d8550068d4367a2799bf089c8c20f0.CUBE",
    "Electrification Key Visual - Innovation-Large.CUBE",
    "GettyImages_1128201588-1.CUBE",
    "GettyImages_1279332587-Large.CUBE",
    "GettyImages_1303695549-Large.CUBE",
    "GettyImages_1341998535-Large.CUBE",
    "GettyImages_615332840.CUBE",
    "GettyImages_664659401-Large.CUBE",
    "Industry - Battery solutions 1-Large 2.CUBE",
    "Industry - Battery solutions 1-Large.CUBE",
    "Industry - Metals 3-Large 2.CUBE",
    "Industry - Metals 3-Large.CUBE",
    "IT programmer working on desktop computer-Large.CUBE",
    "Laptop, review and businessman with client collaboration, teamwork and strategy for company finance.CUBE",
    "MOIM Vaasa Plant Photoshoot - 6 2.CUBE",
    "MOIM Vaasa Plant Photoshoot - 6.CUBE",
    "MOLM Helsinki Factory Product Painting - 3-Large.CUBE",
    "MOLM Västerås Factory Manufacturing - 17-Large_2.CUBE",
    "Solar powered agricultural robot industriously operating in the field 2.CUBE",
    "Solar powered agricultural robot industriously operating in the field.CUBE",
    "SWIFTI CRB 1300 - 2-Large.CUBE"
];

// Add dropdown to page
let lutSelect = document.getElementById('lutSelect');
if (!lutSelect) {
    lutSelect = document.createElement('select');
    lutSelect.id = 'lutSelect';
    document.body.insertBefore(lutSelect, document.body.firstChild);
}
allLuts.forEach(file => {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = file;
    lutSelect.appendChild(option);
});

async function loadAndSetLUT(lutFile) {
    lut = await loadCubeLUT('/luts/' + lutFile);
    if (material && lut) {
        material.uniforms.uLUT3D.value = lut.texture3D;
        material.uniforms.uLUTSize.value = lut.size;
        renderer.render(scene, camera);
    }
}

// Initial LUT load
loadAndSetLUT(lutSelect.value);

lutSelect.addEventListener('change', (e) => {
    loadAndSetLUT(e.target.value);
});


const fileInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('downloadBtn');

let lut;
let renderer, scene, camera, material;




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
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    texture.flipY = false;

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
