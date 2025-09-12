import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class DetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isModelLoaded = false;

  async initialize(): Promise<void> {
    try {
      // Try to set WebGL backend first, fallback to CPU if not available
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js WebGL backend initialized');
      } catch (webglError) {
        console.warn(
          'WebGL backend not available, falling back to CPU:',
          webglError
        );
        await tf.setBackend('cpu');
        await tf.ready();
        console.log('TensorFlow.js CPU backend initialized');
      }

      console.log('TensorFlow.js backend:', tf.getBackend());

      // Load COCO-SSD model
      this.model = await cocoSsd.load();
      this.isModelLoaded = true;
      console.log('COCO-SSD model loaded successfully');
    } catch (error) {
      console.error('Failed to load COCO-SSD model:', error);
      throw error;
    }
  }

  async detectObjects(imageData: string): Promise<any[]> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('Model not loaded yet');
    }

    try {
      // Convert base64 image to tensor
      const imageElement = await this.createImageElement(imageData);
      const predictions = await this.model.detect(imageElement);

      // Filter and format results
      return predictions
        .filter(prediction => prediction.score > 0.3) // Confidence threshold
        .map(prediction => ({
          class: prediction.class,
          score: prediction.score,
          bbox: prediction.bbox,
        }));
    } catch (error) {
      console.error('Object detection failed:', error);
      throw error;
    }
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
      console.error('Clothing analysis failed:', error);
      throw error;
    }
  }

  private async createImageElement(
    imageData: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
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
      { name: 'navy', hex: '#1e3a8a', rgb: [30, 58, 138] },
      { name: 'black', hex: '#000000', rgb: [0, 0, 0] },
      { name: 'white', hex: '#ffffff', rgb: [255, 255, 255] },
      { name: 'gray', hex: '#6b7280', rgb: [107, 114, 128] },
      { name: 'blue', hex: '#3b82f6', rgb: [59, 130, 246] },
      { name: 'red', hex: '#ef4444', rgb: [239, 68, 68] },
      { name: 'green', hex: '#22c55e', rgb: [34, 197, 94] },
      { name: 'brown', hex: '#a3a3a3', rgb: [163, 163, 163] },
      { name: 'beige', hex: '#f5f5dc', rgb: [245, 245, 220] },
    ];

    // Sample pixels and determine dominant colors
    for (let i = 0; i < pixels.length; i += 16) {
      // Sample every 4th pixel
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Find closest color in palette
      let closestColor = colorPalette[0];
      let minDistance = Infinity;

      for (const color of colorPalette) {
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

      colorCounts[closestColor.name] =
        (colorCounts[closestColor.name] || 0) + 1;
    }

    // Find dominant color
    const dominantColorName = Object.keys(colorCounts).reduce((a, b) =>
      colorCounts[a] > colorCounts[b] ? a : b
    );
    const dominantColor =
      colorPalette.find(c => c.name === dominantColorName) || colorPalette[0];

    // Find secondary colors
    const secondaryColors = Object.keys(colorCounts)
      .filter(name => name !== dominantColorName)
      .sort((a, b) => colorCounts[b] - colorCounts[a])
      .slice(0, 3)
      .map(name => colorPalette.find(c => c.name === name))
      .filter(Boolean);

    // Calculate saturation and brightness
    const avgR = dominantColor.rgb[0];
    const avgG = dominantColor.rgb[1];
    const avgB = dominantColor.rgb[2];

    const max = Math.max(avgR, avgG, avgB);
    const min = Math.min(avgR, avgG, avgB);
    const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
    const brightness = (max / 255) * 100;

    // Determine color temperature
    const temperature = (avgR + avgG) / 2 > avgB ? 'warm' : 'cool';

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
    return this.isModelLoaded;
  }
}
