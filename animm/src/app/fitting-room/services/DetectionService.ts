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
    console.log('Color detection results:', {
      totalPixels: pixels.length / 4,
      colorCounts,
      dominantColor: dominantColorName,
      dominantColorHex: dominantColor.hex,
    });

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
      console.log('Low color match confidence, using average RGB:', {
        avgR,
        avgG,
        avgB,
      });

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
      console.log('Using closest color to average:', closestToAverage.name);
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
    return this.isModelLoaded;
  }
}
