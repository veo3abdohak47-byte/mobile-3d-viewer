import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class BasicViewer {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        this.scene.fog = new THREE.Fog(0x222222, 2, 50);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 3;
        
        // Lighting
        this.setupLighting();
        
        // Model
        this.model = null;
        this.loaders = {
            gltf: new GLTFLoader(),
            obj: new OBJLoader(),
            fbx: new FBXLoader()
        };
        
        // Animation loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }
    
    async loadModel(url, filename) {
        // Remove existing model
        if (this.model) {
            this.scene.remove(this.model);
            this.model = null;
        }
        
        try {
            const ext = filename.split('.').pop().toLowerCase();
            let model;
            
            if (ext === 'gltf' || ext === 'glb') {
                const gltf = await this.loaders.gltf.loadAsync(url);
                model = gltf.scene;
            } else if (ext === 'obj') {
                model = await this.loaders.obj.loadAsync(url);
            } else if (ext === 'fbx') {
                model = await this.loaders.fbx.loadAsync(url);
            } else {
                throw new Error('Unsupported file format: ' + ext);
            }
            
            this.model = model;
            this.scene.add(model);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            model.scale.multiplyScalar(scale);
            
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            // Update camera
            this.camera.position.z = 8;
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            
            // Cast shadow on all meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            document.getElementById('basicModelInfo').textContent = `Loaded: ${filename}`;
        } catch (error) {
            console.error('Error loading model:', error);
            document.getElementById('basicModelInfo').textContent = 'Error loading model';
        }
    }
    
    toggleAutoRotate() {
        this.controls.autoRotate = !this.controls.autoRotate;
    }
    
    resetView() {
        if (this.model) {
            this.camera.position.set(0, 0, 8);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
