# Development Guide

## Project Structure

```
mobile-3d-viewer/
├── src/
│   ├── main.js              # Application entry point
│   ├── viewers/
│   │   ├── BasicViewer.js   # Basic 3D viewer implementation
│   │   └── AdvancedViewer.js # Advanced 3D viewer with animations
│   └── styles/
│       └── main.css         # Styling
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md                # Project documentation
```

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This will start a development server at `http://localhost:3000`

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Features

### Basic Viewer
- Load 3D models (GLB, GLTF, OBJ, FBX)
- Touch-based orbit controls
- Auto-rotation toggle
- Reset view
- Fullscreen support

### Advanced Viewer
- **Animation System**
  - Load and play animations
  - Animation speed control
  - Skeleton visualization
  - Play/Pause/Stop controls

- **Lighting Controls**
  - Dynamic light intensity adjustment
  - HDR environment mapping
  - Tone mapping exposure control

- **Material Controls**
  - Metalness adjustment
  - Roughness adjustment
  - Color picker

- **Example Models**
  - Soldier (with walking animation)
  - Duck
  - GLTF Box
  - Parrot

## Supported File Formats

- **glTF (.glb, .gltf)** - Recommended for best results
- **OBJ (.obj)** - Basic geometry support
- **FBX (.fbx)** - Animations and skeletal support

## Key Classes

### BasicViewer

```javascript
const viewer = new BasicViewer(container);
await viewer.loadModel(url, filename);
viewer.toggleAutoRotate();
viewer.resetView();
```

### AdvancedViewer

```javascript
const viewer = new AdvancedViewer(container);
await viewer.loadModel(url, filename);
viewer.selectAnimation(name);
viewer.playAnimation();
viewer.setMetalness(value);
viewer.setRoughness(value);
viewer.setModelColor(hexColor);
viewer.setLightIntensity(value);
```

## Controls

### Touch Controls
- **Single finger drag** - Rotate camera
- **Two finger pinch** - Zoom
- **Double tap** - Reset view

### Keyboard (Advanced Viewer)
- **Arrow Keys** - Pan camera
- **Scroll** - Zoom
- **R** - Reset view

## Three.js Examples Integration

The app loads example models directly from the official Three.js repository:
- https://threejs.org/examples/models/gltf/

Models are loaded dynamically without needing to host them locally.

## Performance Tips

1. Use optimized GLB files for best performance
2. Keep polygon counts under 100k for mobile
3. Use image-based lighting (IBL) for better visual quality
4. Test on actual devices for performance validation

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- **three** - 3D graphics library
- **vite** - Build tool and dev server

## License

MIT
