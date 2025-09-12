# Installation Guide for Virtual Fitting Room

## Quick Setup

1. **Install Dependencies**

   ```bash
   npm install @tensorflow/tfjs @tensorflow-models/coco-ssd
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Navigate to Fitting Room**
   ```
   http://localhost:3000/fitting-room
   ```

## Dependencies Added

The following packages have been added to your `package.json`:

- `@tensorflow/tfjs`: Core TensorFlow.js library
- `@tensorflow-models/coco-ssd`: Pre-trained object detection model
- `@tensorflow/tfjs-backend-webgl`: WebGL backend for GPU acceleration
- `@tensorflow/tfjs-backend-cpu`: CPU backend fallback
- `@radix-ui/react-progress`: Progress bar component

## Browser Requirements

- **Chrome/Edge**: Version 88+ (recommended)
- **Firefox**: Version 85+
- **Safari**: Version 14+
- **WebGL Support**: Required for TensorFlow.js
- **HTTPS**: Required for camera access in production

## First Run

1. The model will download automatically (~27MB) on first load
2. Grant camera permissions when prompted
3. Position yourself in front of the camera
4. Click "Capture & Analyze" to test detection

## Troubleshooting

### Model Loading Issues

- Check internet connection
- Clear browser cache
- Check console for errors

### Camera Issues

- Ensure HTTPS in production
- Check browser permissions
- Try different browsers

### Performance Issues

- Close other browser tabs
- Use a modern device with good GPU
- Reduce camera resolution if needed
