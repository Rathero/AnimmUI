import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class DetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isModelLoaded = false;
  private faceApiModelsLoaded = false;
  private faceapi: any = null;

  // Glasses detection history for time-based voting
  private glassesDetectionHistory: Array<{
    timestamp: number;
    hasGlasses: boolean;
    personDetected: boolean;
  }> = [];
  private readonly GLASSES_VOTING_WINDOW = 30000; // 30 seconds in milliseconds
  private readonly GLASSES_VOTING_THRESHOLD = 0.25; // 25% threshold

  async initialize(): Promise<void> {
    try {
      // Try to set WebGL backend first, fallback to CPU if not available
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        //console.log('TensorFlow.js WebGL backend initialized');
      } catch (webglError) {
        console.warn(
          'WebGL backend not available, falling back to CPU:',
          webglError
        );
        await tf.setBackend('cpu');
        await tf.ready();
        //console.log('TensorFlow.js CPU backend initialized');
      }

      //console.log('TensorFlow.js backend:', tf.getBackend());

      // Load COCO-SSD model
      this.model = await cocoSsd.load();
      this.isModelLoaded = true;
      //console.log('COCO-SSD model loaded successfully');

      // Load face-api.js models
      await this.loadFaceApiModels();
    } catch (error) {
      console.error('Failed to load COCO-SSD model:', error);
      throw error;
    }
  }

  async detectObjects(imageData: string): Promise<any[]> {
    if (this.isModelLoaded && this.model) {
      try {
        // Convert base64 image to tensor
        const imageElement = await this.createImageElement(imageData);
        const predictions = await this.model.detect(imageElement);

        // Filter and format results - lower threshold for glasses detection
        return predictions
          .filter(prediction => {
            // Lower threshold for glasses and person detection
            if (
              prediction.class === 'person' ||
              prediction.class === 'eyeglasses'
            ) {
              return prediction.score > 0.2;
            }
            return prediction.score > 0.3;
          })
          .map(prediction => ({
            class: prediction.class,
            score: prediction.score,
            bbox: prediction.bbox,
          }));
      } catch (error) {
        //console.error('Object detection failed:', error);
        throw error;
      }
    }
    return [];
  }

  async analyzeClothing(imageData: string, clothingItems: any[]): Promise<any> {
    try {
      // Simplified analysis for clothing items
      const analysis = {
        items: await Promise.all(
          clothingItems.map(async item => {
            const colors = await this.analyzeColors(imageData, item.bbox);

            return {
              type: this.mapToClothingType(item.class),
              dominantColor: colors.dominant,
              confidence: item.score,
            };
          })
        ),
        timestamp: new Date().toISOString(),
      };

      return analysis;
    } catch (error) {
      //console.error('Clothing analysis failed:', error);
      throw error;
    }
  }

  private async createImageElement(
    imageData: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        resolve(img);
      };
      img.onerror = error => {
        console.error('Image loading failed:', error);
        reject(error);
      };
      img.crossOrigin = 'anonymous'; // Add CORS for face-api.js
      img.src = imageData;
    });
  }

  private mapToClothingType(className: string): string {
    const clothingMap: { [key: string]: string } = {
      person: 'Outfit',
      tie: 'Tie',
      handbag: 'Handbag',
      backpack: 'Backpack',
      suitcase: 'Luggage',
    };
    return clothingMap[className] || className;
  }

  private async analyzeColors(imageData: string, bbox: number[]): Promise<any> {
    // Enhanced color analysis using Canvas API
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.createImageElement(imageData);

    if (!ctx) throw new Error('Could not get canvas context');

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0);

    // Extract region of interest
    const [x, y, width, height] = bbox;
    const imageData_roi = ctx.getImageData(x, y, width, height);
    const pixels = imageData_roi.data;

    // Analyze colors
    const colorCounts: { [key: string]: number } = {};
    const colorPalette = [
      // Blacks and Grays
      { name: 'black', hex: '#000000', rgb: [0, 0, 0] },
      { name: 'charcoal', hex: '#36454f', rgb: [54, 69, 79] },
      { name: 'dark gray', hex: '#2d3748', rgb: [45, 55, 72] },
      { name: 'gray', hex: '#6b7280', rgb: [107, 114, 128] },
      { name: 'light gray', hex: '#9ca3af', rgb: [156, 163, 175] },
      { name: 'silver', hex: '#c0c0c0', rgb: [192, 192, 192] },
      { name: 'white', hex: '#ffffff', rgb: [255, 255, 255] },
      { name: 'off-white', hex: '#f8f9fa', rgb: [248, 249, 250] },
      { name: 'cream', hex: '#f5f5dc', rgb: [245, 245, 220] },
      { name: 'ivory', hex: '#fffff0', rgb: [255, 255, 240] },

      // Blues
      { name: 'navy', hex: '#1e3a8a', rgb: [30, 58, 138] },
      { name: 'dark blue', hex: '#1e40af', rgb: [30, 64, 175] },
      { name: 'blue', hex: '#3b82f6', rgb: [59, 130, 246] },
      { name: 'royal blue', hex: '#2563eb', rgb: [37, 99, 235] },
      { name: 'sky blue', hex: '#0ea5e9', rgb: [14, 165, 233] },
      { name: 'light blue', hex: '#38bdf8', rgb: [56, 189, 248] },
      { name: 'cyan', hex: '#06b6d4', rgb: [6, 182, 212] },
      { name: 'teal', hex: '#0d9488', rgb: [13, 148, 136] },
      { name: 'turquoise', hex: '#0891b2', rgb: [8, 145, 178] },

      // Reds
      { name: 'red', hex: '#ff0000', rgb: [255, 0, 0] },
      { name: 'bright red', hex: '#ff3333', rgb: [255, 51, 51] },
      { name: 'crimson', hex: '#dc143c', rgb: [220, 20, 60] },
      { name: 'scarlet', hex: '#ff2400', rgb: [255, 36, 0] },
      { name: 'dark red', hex: '#8b0000', rgb: [139, 0, 0] },
      { name: 'burgundy', hex: '#800020', rgb: [128, 0, 32] },
      { name: 'maroon', hex: '#800000', rgb: [128, 0, 0] },
      { name: 'cherry red', hex: '#de3163', rgb: [222, 49, 99] },
      { name: 'fire brick', hex: '#b22222', rgb: [178, 34, 34] },
      { name: 'pink', hex: '#ffc0cb', rgb: [255, 192, 203] },
      { name: 'rose', hex: '#ff69b4', rgb: [255, 105, 180] },
      { name: 'magenta', hex: '#ff00ff', rgb: [255, 0, 255] },

      // Greens
      { name: 'dark green', hex: '#14532d', rgb: [20, 83, 45] },
      { name: 'green', hex: '#22c55e', rgb: [34, 197, 94] },
      { name: 'forest green', hex: '#166534', rgb: [22, 101, 52] },
      { name: 'emerald', hex: '#10b981', rgb: [16, 185, 129] },
      { name: 'lime', hex: '#84cc16', rgb: [132, 204, 22] },
      { name: 'olive', hex: '#365314', rgb: [54, 83, 20] },
      { name: 'sage', hex: '#6b7280', rgb: [107, 114, 128] },
      { name: 'mint', hex: '#6ee7b7', rgb: [110, 231, 183] },

      // Yellows and Oranges
      { name: 'yellow', hex: '#eab308', rgb: [234, 179, 8] },
      { name: 'gold', hex: '#f59e0b', rgb: [245, 158, 11] },
      { name: 'amber', hex: '#f59e0b', rgb: [245, 158, 11] },
      { name: 'orange', hex: '#f97316', rgb: [249, 115, 22] },
      { name: 'dark orange', hex: '#ea580c', rgb: [234, 88, 12] },
      { name: 'peach', hex: '#fed7aa', rgb: [254, 215, 170] },
      { name: 'coral', hex: '#ff7f50', rgb: [255, 127, 80] },
      { name: 'salmon', hex: '#fa8072', rgb: [250, 128, 114] },

      // Purples
      { name: 'purple', hex: '#8b5cf6', rgb: [139, 92, 246] },
      { name: 'violet', hex: '#7c3aed', rgb: [124, 58, 237] },
      { name: 'lavender', hex: '#a78bfa', rgb: [167, 139, 250] },
      { name: 'plum', hex: '#581c87', rgb: [88, 28, 135] },
      { name: 'indigo', hex: '#4c1d95', rgb: [76, 29, 149] },
      { name: 'mauve', hex: '#c084fc', rgb: [192, 132, 252] },

      // Browns and Tans
      { name: 'brown', hex: '#92400e', rgb: [146, 64, 14] },
      { name: 'dark brown', hex: '#451a03', rgb: [69, 26, 3] },
      { name: 'light brown', hex: '#d97706', rgb: [217, 119, 6] },
      { name: 'tan', hex: '#d2b48c', rgb: [210, 180, 140] },
      { name: 'beige', hex: '#f5f5dc', rgb: [245, 245, 220] },
      { name: 'khaki', hex: '#f0e68c', rgb: [240, 230, 140] },
      { name: 'camel', hex: '#c19a6b', rgb: [193, 154, 107] },
      { name: 'coffee', hex: '#6f4e37', rgb: [111, 78, 55] },
      { name: 'chocolate', hex: '#7b3f00', rgb: [123, 63, 0] },

      // Special Colors
      { name: 'denim', hex: '#1e40af', rgb: [30, 64, 175] },
      { name: 'jeans blue', hex: '#1565c0', rgb: [21, 101, 192] },
      { name: 'stone', hex: '#78716c', rgb: [120, 113, 108] },
      { name: 'slate', hex: '#475569', rgb: [71, 85, 105] },
      { name: 'zinc', hex: '#71717a', rgb: [113, 113, 122] },
      { name: 'neutral', hex: '#a8a29e', rgb: [168, 162, 158] },
    ];

    // Sample pixels and determine dominant colors
    // Sample more pixels for better accuracy
    for (let i = 0; i < pixels.length; i += 4) {
      // Sample every pixel for better accuracy
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      // Find closest color in palette using improved distance calculation
      let closestColor = colorPalette[0];
      let minDistance = Infinity;

      for (const color of colorPalette) {
        // Use standard Euclidean distance for better color matching
        const distance = Math.sqrt(
          Math.pow(r - color.rgb[0], 2) +
            Math.pow(g - color.rgb[1], 2) +
            Math.pow(b - color.rgb[2], 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestColor = color;
        }
      }

      // Count all colors, but weight them by distance
      const weight = Math.max(0, 1 - minDistance / 200); // Normalize distance to 0-1
      if (weight > 0.1) {
        // Only count if reasonably close
        colorCounts[closestColor.name] =
          (colorCounts[closestColor.name] || 0) + weight;
      }
    }

    // Find dominant color
    let dominantColorName = 'red'; // Default fallback
    if (Object.keys(colorCounts).length > 0) {
      dominantColorName = Object.keys(colorCounts).reduce((a, b) =>
        colorCounts[a] > colorCounts[b] ? a : b
      );
    }
    let dominantColor =
      colorPalette.find(c => c.name === dominantColorName) || colorPalette[0];

    // Debug logging
    /*console.log('Color detection results:', {
      totalPixels: pixels.length / 4,
      colorCounts,
      dominantColor: dominantColorName,
      dominantColorHex: dominantColor.hex,
    });*/

    // Find secondary colors (up to 5 additional colors)
    const secondaryColors = Object.keys(colorCounts)
      .filter(name => name !== dominantColorName)
      .sort((a, b) => colorCounts[b] - colorCounts[a])
      .slice(0, 5)
      .map(name => colorPalette.find(c => c.name === name))
      .filter(Boolean);

    // Calculate actual average RGB values from the image
    let totalR = 0,
      totalG = 0,
      totalB = 0,
      pixelCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const a = pixels[i + 3];
      if (a >= 128) {
        // Skip transparent pixels
        totalR += pixels[i];
        totalG += pixels[i + 1];
        totalB += pixels[i + 2];
        pixelCount++;
      }
    }

    const avgR = pixelCount > 0 ? totalR / pixelCount : 0;
    const avgG = pixelCount > 0 ? totalG / pixelCount : 0;
    const avgB = pixelCount > 0 ? totalB / pixelCount : 0;

    const max = Math.max(avgR, avgG, avgB);
    const min = Math.min(avgR, avgG, avgB);
    const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
    const brightness = (max / 255) * 100;

    // Determine color temperature
    const temperature = (avgR + avgG) / 2 > avgB ? 'warm' : 'cool';

    // If we have very few color matches, try to find the closest color to actual average
    if (
      Object.keys(colorCounts).length === 0 ||
      Math.max(...Object.values(colorCounts)) < 1
    ) {
      /*console.log('Low color match confidence, using average RGB:', {
        avgR,
        avgG,
        avgB,
      });*/

      // Find the closest color to the actual average RGB
      let closestToAverage = colorPalette[0];
      let minDistanceToAverage = Infinity;

      for (const color of colorPalette) {
        const distance = Math.sqrt(
          Math.pow(avgR - color.rgb[0], 2) +
            Math.pow(avgG - color.rgb[1], 2) +
            Math.pow(avgB - color.rgb[2], 2)
        );

        if (distance < minDistanceToAverage) {
          minDistanceToAverage = distance;
          closestToAverage = color;
        }
      }

      dominantColor = closestToAverage;
      //console.log('Using closest color to average:', closestToAverage.name);
    }

    return {
      dominant: dominantColor,
      secondary: secondaryColors,
      palette: [dominantColor, ...secondaryColors],
      saturation: Math.round(saturation),
      brightness: Math.round(brightness),
      temperature,
    };
  }

  private async analyzeShape(imageData: string, bbox: number[]): Promise<any> {
    // Enhanced shape analysis using Canvas API
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = await this.createImageElement(imageData);

    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Extract region of interest
    const [x, y, width, height] = bbox;
    const imageData_roi = ctx.getImageData(x, y, width, height);

    // Analyze shape characteristics
    const aspectRatio = width / height;
    const area = width * height;

    // Determine shape type based on aspect ratio and area
    let shapeType = 'regular';
    if (aspectRatio > 1.5) shapeType = 'wide';
    else if (aspectRatio < 0.7) shapeType = 'tall';
    else if (area < 10000) shapeType = 'small';
    else if (area > 50000) shapeType = 'large';

    // Generate characteristics based on analysis
    const characteristics = [];
    if (aspectRatio > 1.2) characteristics.push('wide-fit');
    if (aspectRatio < 0.8) characteristics.push('slim-fit');
    if (area > 30000) characteristics.push('oversized');
    if (area < 15000) characteristics.push('fitted');

    return {
      type: shapeType,
      confidence: 0.7 + Math.random() * 0.3,
      characteristics,
      proportions: {
        length: Math.min(100, (height / img.height) * 100),
        width: Math.min(100, (width / img.width) * 100),
        fit: Math.min(100, (area / (img.width * img.height)) * 100),
      },
    };
  }

  private async detectMaterial(
    imageData: string,
    bbox: number[]
  ): Promise<any> {
    // Simulate material detection based on color and texture analysis
    const colors = await this.analyzeColors(imageData, bbox);

    // Material detection based on color characteristics
    let material = { name: 'cotton', confidence: 0.7 };

    if (colors.saturation > 80) {
      material = { name: 'synthetic', confidence: 0.8 };
    } else if (colors.brightness < 30) {
      material = { name: 'leather', confidence: 0.6 };
    } else if (colors.temperature === 'cool') {
      material = { name: 'denim', confidence: 0.75 };
    }

    return material;
  }

  private determineOverallStyle(items: any[]): string {
    const styles = [
      'casual',
      'formal',
      'sporty',
      'elegant',
      'bohemian',
      'minimalist',
    ];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  private calculateColorHarmony(items: any[]): number {
    // Simulate color harmony calculation
    return Math.floor(60 + Math.random() * 40);
  }

  private generateRecommendations(items: any[]): string[] {
    const recommendations = [
      'This color combination creates a harmonious look',
      'Consider adding a contrasting accessory for visual interest',
      'The fit works well for your body type',
      'Try layering with a complementary piece',
      'This outfit is perfect for casual occasions',
      'Consider adding a statement piece to elevate the look',
      'The proportions are well-balanced',
      'This style works well for both day and evening',
    ];

    return recommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2);
  }

  // Method to check if model is ready
  isReady(): boolean {
    return this.isModelLoaded && this.faceApiModelsLoaded;
  }

  // Add detection result to history
  private addDetectionToHistory(
    hasGlasses: boolean,
    personDetected: boolean
  ): void {
    const now = Date.now();

    // Add new detection
    this.glassesDetectionHistory.push({
      timestamp: now,
      hasGlasses,
      personDetected,
    });

    // Clean up old detections (older than 30 seconds)
    const beforeCleanup = this.glassesDetectionHistory.length;
    this.glassesDetectionHistory = this.glassesDetectionHistory.filter(
      detection => now - detection.timestamp <= this.GLASSES_VOTING_WINDOW
    );

    // Log history updates for debugging
    if (beforeCleanup !== this.glassesDetectionHistory.length) {
      console.log(
        `Cleaned up ${
          beforeCleanup - this.glassesDetectionHistory.length
        } old detections from history`
      );
    }
  }

  // Reset detection history when person detection stops
  private resetDetectionHistory(): void {
    this.glassesDetectionHistory = [];
    console.log('Glasses detection history reset - person detection stopped');
  }

  // Get glasses detection result based on voting from last 30 seconds
  private getVotedGlassesDetection(): {
    hasGlasses: boolean;
    confidence: number;
  } {
    const now = Date.now();

    // Filter detections from last 30 seconds where person was detected
    const recentPersonDetections = this.glassesDetectionHistory.filter(
      detection =>
        now - detection.timestamp <= this.GLASSES_VOTING_WINDOW &&
        detection.personDetected
    );

    if (recentPersonDetections.length === 0) {
      return { hasGlasses: false, confidence: 0 };
    }

    // Calculate percentage of detections that found glasses
    const glassesDetections = recentPersonDetections.filter(
      d => d.hasGlasses
    ).length;
    const glassesPercentage = glassesDetections / recentPersonDetections.length;

    // If at least 25% of detections say glasses, then person has glasses
    const hasGlasses = glassesPercentage >= this.GLASSES_VOTING_THRESHOLD;
    /*
    console.log('Glasses voting result:', {
      totalDetections: recentPersonDetections.length,
      glassesDetections,
      glassesPercentage: (glassesPercentage * 100).toFixed(1) + '%',
      threshold: this.GLASSES_VOTING_THRESHOLD * 100 + '%',
      finalResult: hasGlasses,
    });*/

    return {
      hasGlasses,
      confidence: glassesPercentage,
    };
  }

  // Load face-api.js models
  private async loadFaceApiModels(): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      if (typeof window === 'undefined') {
        console.log('Face-api.js not available on server side');
        this.faceApiModelsLoaded = false;
        return;
      }

      const faceApiModule = await import('@vladmandic/face-api');
      this.faceapi = faceApiModule.default || faceApiModule;
      const faceapi = this.faceapi;

      console.log('Face-api module loaded:', !!this.faceapi);
      console.log(
        'Face-api methods available:',
        Object.keys(this.faceapi || {})
      );

      const MODEL_URL = '/models'; // path to the models in the public folder

      // Ensure TensorFlow.js is ready for face-api.js
      await tf.ready();
      console.log('TensorFlow.js ready for face-api.js');

      // Load models sequentially to avoid conflicts
      console.log('Loading tinyFaceDetector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log('TinyFaceDetector loaded');

      console.log('Loading faceLandmark68Net...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log('FaceLandmark68Net loaded');

      // Add a small delay to ensure models are fully initialized
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify models are actually loaded
      if (
        faceapi.nets.tinyFaceDetector.isLoaded &&
        faceapi.nets.faceLandmark68Net.isLoaded
      ) {
        this.faceApiModelsLoaded = true;
        console.log('Face-api.js models loaded and verified successfully');
      } else {
        throw new Error('Models loaded but not properly initialized');
      }
    } catch (error) {
      console.error('Error loading face-api.js models:', error);
      // Don't throw error, just mark as not loaded so fallback can be used
      this.faceApiModelsLoaded = false;
    }
  }

  // Check for glasses using face landmarks
  private checkForGlasses(landmarks: any): boolean {
    try {
      // These are the specific landmark points for eyebrows and eyes
      const leftEyebrow = landmarks.getLeftEyeBrow();
      const rightEyebrow = landmarks.getRightEyeBrow();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // Calculate the average vertical distance between the bottom of the eyebrows and the top of the eyes.
      const avgLeftDistance =
        (leftEye[0].y - leftEyebrow[4].y + leftEye[1].y - leftEyebrow[3].y) / 2;
      const avgRightDistance =
        (rightEye[0].y -
          rightEyebrow[4].y +
          rightEye[1].y -
          rightEyebrow[3].y) /
        2;

      // A heuristic threshold. If the distance is very small, it's likely
      // because a glasses frame is covering the space.
      // This value may need tuning depending on the camera, lighting, etc.
      const GLASSES_THRESHOLD = 30; // You can adjust this value

      const hasGlasses =
        avgLeftDistance < GLASSES_THRESHOLD &&
        avgRightDistance < GLASSES_THRESHOLD;

      console.log('Face-api glasses detection:', {
        avgLeftDistance: avgLeftDistance.toFixed(2),
        avgRightDistance: avgRightDistance.toFixed(2),
        hasGlasses,
        threshold: GLASSES_THRESHOLD,
      });

      return hasGlasses;
    } catch (error) {
      console.error('Error in glasses detection:', error);
      return false;
    }
  }

  // Method specifically for glasses detection using face-api.js with voting system
  async detectGlasses(imageData: string): Promise<{
    personDetected: boolean;
    glassesDetected: boolean;
    personValue: number;
  }> {
    try {
      // First check if face-api.js models are loaded
      if (!this.faceApiModelsLoaded) {
        console.log(
          'Face-api.js models not loaded yet, falling back to COCO-SSD'
        );
        return await this.detectGlassesFallback(imageData);
      }

      // Additional check to ensure face-api.js is properly initialized
      if (
        !this.faceapi ||
        !this.faceapi.nets.tinyFaceDetector.isLoaded ||
        !this.faceapi.nets.faceLandmark68Net.isLoaded
      ) {
        console.log(
          'Face-api.js models not properly loaded, falling back to COCO-SSD'
        );
        return await this.detectGlassesFallback(imageData);
      }

      // Create image element from base64 data
      const img = await this.createImageElement(imageData);

      // Use face-api.js to detect face and landmarks
      let detections = null;
      try {
        /*
        console.log('Attempting face detection with face-api.js...');
        console.log('Image dimensions:', img.width, 'x', img.height);
        console.log('Face-api available:', !!this.faceapi);
        console.log(
          'TinyFaceDetector loaded:',
          this.faceapi?.nets?.tinyFaceDetector?.isLoaded
        );
        console.log(
          'FaceLandmark68Net loaded:',
          this.faceapi?.nets?.faceLandmark68Net?.isLoaded
        );*/

        // Try different detection options
        const detectionOptions = new this.faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.1, // Lower threshold for better detection
        });

        // Try multiple detection methods
        //console.log('Trying detectSingleFace...');
        detections = await this.faceapi
          .detectSingleFace(img, detectionOptions)
          .withFaceLandmarks();

        // If no face detected, try detectAllFaces
        if (!detections) {
          //console.log('No single face detected, trying detectAllFaces...');
          const allFaces = await this.faceapi
            .detectAllFaces(img, detectionOptions)
            .withFaceLandmarks();

          if (allFaces && allFaces.length > 0) {
            detections = allFaces[0]; // Use the first face
            //console.log('Found face using detectAllFaces:', detections);
          }
        }

        //console.log('Face detection result:', detections);
      } catch (faceApiError) {
        console.error('Face-api.js detection error:', faceApiError);
        // Fall through to COCO-SSD fallback
      }

      let personDetected = false;
      let currentGlassesDetected = false;

      if (detections) {
        personDetected = true;
        // Use face landmarks to detect glasses
        try {
          currentGlassesDetected = this.checkForGlasses(detections.landmarks);
        } catch (landmarkError) {
          console.error('Error in landmark analysis:', landmarkError);
          currentGlassesDetected = false;
        }
      } else {
        // Fallback to COCO-SSD for person detection
        const results = await this.detectObjects(imageData);
        personDetected = results.some(
          item => item.class === 'person' && item.score > 0.5
        );

        if (personDetected) {
          // Use fallback glasses detection
          const fallbackResult = await this.detectGlassesFallback(imageData);
          currentGlassesDetected = fallbackResult.glassesDetected;
        }
      }

      // Check if person detection just stopped (transition from detected to not detected)
      const wasPersonDetected =
        this.glassesDetectionHistory.length > 0 &&
        this.glassesDetectionHistory[this.glassesDetectionHistory.length - 1]
          .personDetected;

      if (wasPersonDetected && !personDetected) {
        this.resetDetectionHistory();
      }

      // Add current detection to history
      this.addDetectionToHistory(currentGlassesDetected, personDetected);

      // Get voted glasses detection result
      const votedResult = this.getVotedGlassesDetection();
      const glassesDetected = votedResult.hasGlasses;

      let personValue = 0; // No person detected
      if (personDetected) {
        personValue = glassesDetected ? 2 : 1; // 1 = person with glasses, 2 = person without glasses
      }
      /*
      console.log('Face-api glasses detection result:', {
        personDetected,
        currentGlassesDetected,
        votedGlassesDetected: glassesDetected,
        confidence: (votedResult.confidence * 100).toFixed(1) + '%',
        personValue,
        faceDetected: !!detections,
      });*/

      return {
        personDetected,
        glassesDetected,
        personValue,
      };
    } catch (error) {
      console.error('Face-api glasses detection failed:', error);
      // Fallback to COCO-SSD detection
      return await this.detectGlassesFallback(imageData);
    }
  }

  // Fallback method using COCO-SSD
  private async detectGlassesFallback(imageData: string): Promise<{
    personDetected: boolean;
    glassesDetected: boolean;
    personValue: number;
  }> {
    try {
      const results = await this.detectObjects(imageData);
      //console.log('Detection results:', results);

      // Look for person detection
      const personDetected = results.some(
        item => item.class === 'person' && item.score > 0.5
      );

      let glassesDetected = false;

      if (personDetected) {
        // Try to detect glasses using a simple image analysis approach
        glassesDetected = await this.detectGlassesInImage(imageData);

        // Fallback: If detection fails, use a simple heuristic based on image characteristics
        if (!glassesDetected) {
          glassesDetected = await this.detectGlassesFallbackImage(imageData);
        }
      }

      let personValue = 0; // No person detected
      if (personDetected) {
        personValue = glassesDetected ? 1 : 2; // 1 = person with glasses, 2 = person without glasses
      }

      /*console.log('Glasses detection result:', {
        personDetected,
        glassesDetected,
        personValue,
        allClasses: results.map(r => r.class),
      });*/

      return {
        personDetected,
        glassesDetected,
        personValue,
      };
    } catch (error) {
      console.error('Fallback glasses detection failed:', error);
      return {
        personDetected: false,
        glassesDetected: false,
        personValue: 0,
      };
    }
  }

  // Enhanced glasses detection using multiple image analysis techniques
  private async detectGlassesInImage(imageData: string): Promise<boolean> {
    try {
      const img = await this.createImageElement(imageData);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Focus on the upper portion of the image where glasses would be
      const faceRegion = {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height * 0.4, // Upper 40% of the image
      };

      const imageData_face = ctx.getImageData(
        faceRegion.x,
        faceRegion.y,
        faceRegion.width,
        faceRegion.height
      );

      const pixels = imageData_face.data;
      let darkPixelCount = 0;
      let edgePixelCount = 0;
      let totalPixels = 0;
      let horizontalLineCount = 0;

      // Analyze pixels for glasses characteristics
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        totalPixels++;

        // Count very dark pixels (potential glasses frames)
        if (brightness < 60) {
          darkPixelCount++;
        }

        // Count edge pixels (potential glasses edges)
        if (brightness > 20 && brightness < 120) {
          edgePixelCount++;
        }
      }

      // Look for horizontal lines (glasses frames are often horizontal)
      for (let y = 0; y < faceRegion.height - 1; y++) {
        let lineDarkPixels = 0;
        for (let x = 0; x < faceRegion.width; x++) {
          const pixelIndex = (y * faceRegion.width + x) * 4;
          const r = pixels[pixelIndex];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          const brightness = (r + g + b) / 3;

          if (brightness < 80) {
            lineDarkPixels++;
          }
        }

        // If a horizontal line has many dark pixels, it might be glasses
        if (lineDarkPixels > faceRegion.width * 0.3) {
          horizontalLineCount++;
        }
      }

      // Calculate ratios
      const darkPixelRatio = darkPixelCount / totalPixels;
      const edgePixelRatio = edgePixelCount / totalPixels;
      const horizontalLineRatio = horizontalLineCount / faceRegion.height;

      // Enhanced detection logic
      const hasGlasses =
        darkPixelRatio > 0.03 || // 3% dark pixels
        edgePixelRatio > 0.15 || // 15% edge pixels
        horizontalLineRatio > 0.1; // 10% horizontal lines

      /*console.log('Enhanced glasses analysis:', {
        darkPixelRatio: darkPixelRatio.toFixed(4),
        edgePixelRatio: edgePixelRatio.toFixed(4),
        horizontalLineRatio: horizontalLineRatio.toFixed(4),
        hasGlasses,
        totalPixels,
        darkPixelCount,
        edgePixelCount,
        horizontalLineCount,
      });*/

      return hasGlasses;
    } catch (error) {
      //console.error('Glasses image analysis failed:', error);
      return false;
    }
  }

  // Simple fallback glasses detection
  private async detectGlassesFallbackImage(
    imageData: string
  ): Promise<boolean> {
    try {
      const img = await this.createImageElement(imageData);

      // Simple heuristic: check if the image has certain characteristics
      // This is a very basic approach for demo purposes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData_ctx = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData_ctx.data;

      // Count pixels in different brightness ranges
      let veryDarkPixels = 0;
      let darkPixels = 0;
      let totalPixels = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        totalPixels++;

        if (brightness < 30) {
          veryDarkPixels++;
        } else if (brightness < 80) {
          darkPixels++;
        }
      }

      // Simple heuristic: if there are enough dark pixels, assume glasses
      const veryDarkRatio = veryDarkPixels / totalPixels;
      const darkRatio = darkPixels / totalPixels;

      const hasGlasses = veryDarkRatio > 0.02 || darkRatio > 0.1;

      /*console.log('Fallback glasses detection:', {
        veryDarkRatio: veryDarkRatio.toFixed(4),
        darkRatio: darkRatio.toFixed(4),
        hasGlasses,
        totalPixels,
        veryDarkPixels,
        darkPixels,
      });*/

      return hasGlasses;
    } catch (error) {
      console.error('Fallback glasses detection failed:', error);
      return false;
    }
  }
}
