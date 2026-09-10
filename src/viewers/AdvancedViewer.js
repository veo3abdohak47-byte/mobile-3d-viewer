import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class AdvancedViewer {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x5e5d5d);
        this.scene.fog = new THREE.Fog(0x5e5d5d, 2, 50);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 2, -5);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1, 0);
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.update();
        
        // Lighting
        this.setupLighting();
        
        // Model and animation
        this.model = null;
        this.skeleton = null;
        this.mixer = null;
        this.actions = {};
        this.currentAction = null;
        this.clock = new THREE.Clock();
        
        this.loaders = {
            gltf: new GLTFLoader(),
            obj: new OBJLoader(),
            fbx: new FBXLoader(),
            hdr: new RGBELoader()
        };
        
        // Material settings
        this.materialSettings = {
            metalness: 1.0,
            roughness: 0.2,
            color: new THREE.Color(0xffffff)
        };
        
        // Load HDR environment
        this.loadEnvironment();
        
        // Animation loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Sun Light
        const sunLight = new THREE.DirectionalLight(0xffffff, 5);
        sunLight.position.set(-2, 5, -3);
        sunLight.castShadow = true;
        sunLight.shadow.camera.far = 20;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        this.sunLight = sunLight;
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;
    }
    
    async loadEnvironment() {
        try {
            const hdrUrl = 'https://threejs.org/examples/textures/equirectangular/lobe.hdr';
            const texture = await this.loaders.hdr.loadAsync(hdrUrl);
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;
            this.scene.environmentIntensity = 1.5;
        } catch (error) {
            console.warn('Failed to load HDR environment:', error);
        }
    }
    
    async loadModel(url, filename) {
        // Remove existing model
        if (this.model) {
            this.scene.remove(this.model);
            if (this.skeleton) {
                this.scene.remove(this.skeleton);
                this.skeleton = null;
            }
            this.model = null;
            this.mixer = null;
            this.actions = {};
        }
        
        try {
            const ext = filename.split('.').pop().toLowerCase();
            let model, animations = [];
            
            if (ext === 'gltf' || ext === 'glb') {
                const gltf = await this.loaders.gltf.loadAsync(url);
                model = gltf.scene;
                animations = gltf.animations || [];
            } else if (ext === 'obj') {
                model = await this.loaders.obj.loadAsync(url);
            } else if (ext === 'fbx') {
                model = await this.loaders.fbx.loadAsync(url);
                animations = model.animations || [];
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
            
            // Apply material settings
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material) {
                        child.material.metalness = this.materialSettings.metalness;
                        child.material.roughness = this.materialSettings.roughness;
                        child.material.color.copy(this.materialSettings.color);
                    }
                }
            });
            
            // Create skeleton if it exists
            if (model.skeleton) {
                this.skeleton = new THREE.SkeletonHelper(model);
                this.skeleton.setColors(
                    new THREE.Color(0xe000ff),
                    new THREE.Color(0x00e0ff)
                );
                this.skeleton.visible = false;
                this.scene.add(this.skeleton);
            }
            
            // Setup animations
            if (animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(model);
                this.setupAnimations(animations);
            } else {
                this.clearAnimations();
            }
            
            // Update camera
            this.camera.position.set(0, 2, -5);
            this.controls.target.set(0, 1, 0);
            this.controls.update();
            
            document.getElementById('advancedModelInfo').textContent = `Loaded: ${filename} (${animations.length} animations)`;
        } catch (error) {
            console.error('Error loading model:', error);
            document.getElementById('advancedModelInfo').textContent = 'Error loading model';
        }
    }
    
    setupAnimations(animations) {
        const select = document.getElementById('animationSelect');
        select.innerHTML = '<option>Select animation</option>';
        
        this.actions = {};
        animations.forEach((clip, index) => {
            const action = this.mixer.clipAction(clip);
            this.actions[clip.name] = action;
            
            const option = document.createElement('option');
            option.value = clip.name;
            option.textContent = clip.name || `Animation ${index}`;
            select.appendChild(option);
        });
    }
    
    clearAnimations() {
        const select = document.getElementById('animationSelect');
        select.innerHTML = '<option>No animations</option>';
        this.actions = {};
    }
    
    selectAnimation(name) {
        if (name && this.actions[name]) {
            if (this.currentAction) {
                this.currentAction.stop();
            }
            this.currentAction = this.actions[name];
            this.currentAction.play();
        }
    }
    
    playAnimation() {
        if (this.currentAction) {
            this.currentAction.play();
        }
    }
    
    pauseAnimation() {
        if (this.currentAction) {
            this.currentAction.paused = true;
        }
    }
    
    stopAnimation() {
        if (this.currentAction) {
            this.currentAction.stop();
        }
    }
    
    setAnimationSpeed(speed) {
        if (this.currentAction) {
            this.currentAction.timeScale = speed;
        }
    }
    
    toggleSkeleton(visible) {
        if (this.skeleton) {
            this.skeleton.visible = visible;
        }
    }
    
    setLightIntensity(intensity) {
        this.sunLight.intensity = intensity;
    }
    
    setEnvironmentIntensity(intensity) {
        if (this.scene.environment) {
            this.scene.environmentIntensity = intensity;
        }
    }
    
    setToneMappingExposure(exposure) {
        this.renderer.toneMappingExposure = exposure;
    }
    
    setMetalness(value) {
        this.materialSettings.metalness = value;
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.metalness = value;
                }
            });
        }
    }
    
    setRoughness(value) {
        this.materialSettings.roughness = value;
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.roughness = value;
                }
            });
        }
    }
    
    setModelColor(hexColor) {
        this.materialSettings.color.setHex(parseInt(hexColor.replace('#', ''), 16));
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.copy(this.materialSettings.color);
                }
            });
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
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
