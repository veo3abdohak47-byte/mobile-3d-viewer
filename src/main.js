import { BasicViewer } from './viewers/BasicViewer.js';
import { AdvancedViewer } from './viewers/AdvancedViewer.js';
import './styles/main.css';

let basicViewer = null;
let advancedViewer = null;
let currentMode = 'basic';

function initViewers() {
    // Initialize Basic Viewer
    const basicContainer = document.getElementById('basicCanvas');
    basicViewer = new BasicViewer(basicContainer);
    
    // Initialize Advanced Viewer
    const advancedContainer = document.getElementById('advancedCanvas');
    advancedViewer = new AdvancedViewer(advancedContainer);
    
    setupModeSelector();
    setupBasicViewerControls();
    setupAdvancedViewerControls();
    setupTabNavigation();
}

function setupModeSelector() {
    const basicBtn = document.getElementById('basicViewerBtn');
    const advancedBtn = document.getElementById('advancedViewerBtn');
    const basicViewer = document.getElementById('basicViewer');
    const advancedViewer = document.getElementById('advancedViewer');
    
    basicBtn.addEventListener('click', () => {
        currentMode = 'basic';
        basicViewer.classList.add('active');
        advancedViewer.classList.remove('active');
        basicBtn.classList.add('active');
        advancedBtn.classList.remove('active');
        window.dispatchEvent(new Event('resize'));
    });
    
    advancedBtn.addEventListener('click', () => {
        currentMode = 'advanced';
        basicViewer.classList.remove('active');
        advancedViewer.classList.add('active');
        basicBtn.classList.remove('active');
        advancedBtn.classList.add('active');
        window.dispatchEvent(new Event('resize'));
    });
}

function setupBasicViewerControls() {
    const fileInput = document.getElementById('basicFileInput');
    const uploadBtn = document.getElementById('basicUploadBtn');
    const autoRotateBtn = document.getElementById('basicAutoRotateBtn');
    const resetBtn = document.getElementById('basicResetBtn');
    const fullscreenBtn = document.getElementById('basicFullscreenBtn');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            await basicViewer.loadModel(url, file.name);
        }
    });
    
    autoRotateBtn.addEventListener('click', () => {
        basicViewer.toggleAutoRotate();
        autoRotateBtn.classList.toggle('active');
    });
    
    resetBtn.addEventListener('click', () => {
        basicViewer.resetView();
    });
    
    fullscreenBtn.addEventListener('click', () => {
        const canvas = document.getElementById('basicCanvas');
        canvas.requestFullscreen().catch(err => console.log(err));
    });
}

function setupAdvancedViewerControls() {
    const fileInput = document.getElementById('advancedFileInput');
    const uploadBtn = document.getElementById('advancedUploadBtn');
    
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            await advancedViewer.loadModel(url, file.name);
        }
    });
    
    // Animation Controls
    const animSelect = document.getElementById('animationSelect');
    const playBtn = document.getElementById('playAnimBtn');
    const pauseBtn = document.getElementById('pauseAnimBtn');
    const stopBtn = document.getElementById('stopAnimBtn');
    const animSpeed = document.getElementById('animSpeed');
    const skeletonToggle = document.getElementById('skeletonToggle');
    
    playBtn.addEventListener('click', () => advancedViewer.playAnimation());
    pauseBtn.addEventListener('click', () => advancedViewer.pauseAnimation());
    stopBtn.addEventListener('click', () => advancedViewer.stopAnimation());
    
    animSelect.addEventListener('change', (e) => {
        advancedViewer.selectAnimation(e.target.value);
    });
    
    animSpeed.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        advancedViewer.setAnimationSpeed(speed);
        document.getElementById('speedValue').textContent = speed.toFixed(1) + 'x';
    });
    
    skeletonToggle.addEventListener('change', (e) => {
        advancedViewer.toggleSkeleton(e.target.checked);
    });
    
    // Lighting Controls
    const lightIntensity = document.getElementById('lightIntensity');
    const envIntensity = document.getElementById('envIntensity');
    const toneMappingExp = document.getElementById('toneMappingExposure');
    
    lightIntensity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        advancedViewer.setLightIntensity(val);
        document.getElementById('intensityValue').textContent = val.toFixed(1);
    });
    
    envIntensity.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        advancedViewer.setEnvironmentIntensity(val);
        document.getElementById('envIntensityValue').textContent = val.toFixed(1);
    });
    
    toneMappingExp.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        advancedViewer.setToneMappingExposure(val);
        document.getElementById('exposureValue').textContent = val.toFixed(1);
    });
    
    // Material Controls
    const metalness = document.getElementById('metalness');
    const roughness = document.getElementById('roughness');
    const modelColor = document.getElementById('modelColor');
    
    metalness.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        advancedViewer.setMetalness(val);
        document.getElementById('metalnessValue').textContent = val.toFixed(1);
    });
    
    roughness.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        advancedViewer.setRoughness(val);
        document.getElementById('roughnessValue').textContent = val.toFixed(1);
    });
    
    modelColor.addEventListener('change', (e) => {
        advancedViewer.setModelColor(e.target.value);
    });
    
    // Example Models
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const modelName = btn.dataset.model;
            await loadExampleModel(advancedViewer, modelName);
        });
    });
}

function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

async function loadExampleModel(viewer, modelName) {
    const exampleModels = {
        'soldier': 'https://threejs.org/examples/models/gltf/Soldier.glb',
        'duck': 'https://threejs.org/examples/models/gltf/Duck.glb',
        'gltf-box': 'https://threejs.org/examples/models/gltf/Box.glb',
        'parrot': 'https://threejs.org/examples/models/gltf/Parrot.glb'
    };
    
    const url = exampleModels[modelName];
    if (url) {
        try {
            await viewer.loadModel(url, modelName);
            document.getElementById('advancedModelInfo').textContent = `Loaded: ${modelName}`;
        } catch (error) {
            console.error('Failed to load example model:', error);
            document.getElementById('advancedModelInfo').textContent = 'Failed to load model';
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewers);
} else {
    initViewers();
}
