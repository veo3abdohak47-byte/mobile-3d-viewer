# Mobile 3D Viewer App

A mobile-friendly 3D viewer application built with Three.js supporting GLTF/GLB models with two viewing modes:

- **Basic Viewer**: Simple 3D model viewing with touch controls
- **Advanced Viewer**: Full-featured viewer with animations, lighting controls, and skeleton visualization

## Features

### Basic Viewer
- Load and display 3D models (GLTF/GLB)
- Touch-based orbit controls
- Auto-rotation toggle
- Responsive design

### Advanced Viewer
- Skeletal animation support
- Animation playback controls
- Dynamic lighting
- Real-time HDR environment mapping
- Material customization
- Performance monitoring
- Skeleton visualization toggle

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Model Format Support

- glTF (.gltf)
- glTF Binary (.glb)

## Controls

### Touch Controls
- **Single finger drag**: Rotate view
- **Two finger pinch**: Zoom in/out
- **Double tap**: Reset view

### Keyboard Controls (Advanced Viewer)
- **Arrow Keys / WASD**: Move character
- **Shift**: Run
- **Ctrl + S**: Toggle skeleton visibility
