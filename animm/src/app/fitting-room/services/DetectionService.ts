import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class DetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isModelLoaded = false;
  private faceApiModelsLoaded = false;
  private faceapi: any = null;

  // Beard detection history for time-based voting
  private beardDetectionHistory: Array<{
    timestamp: number;
    hasBeard: boolean;
    personDetected: boolean;
  }> = [];
  private readonly BEARD_VOTING_WINDOW = 30000; // 30 seconds in milliseconds
  private readonly BEARD_VOTING_THRESHOLD = 0.25; // 25% threshold

  async initialize(): Promise<void> {
    try {
      // Try to set WebGL backend first, fallback to CPU if not available
      try {
        await tf.setBackend('webgl');
        await tf.ready();
      } catch (webglError) {
        console.warn(
          'WebGL backend not available, falling back to CPU:',
          webglError
        );
        await tf.setBackend('cpu');
        await tf.ready();
      }

      // Load COCO-SSD model
      this.model = await cocoSsd.load();
      this.isModelLoaded = true;

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

        // Filter and format results - focus on person detection
        return predictions
          .filter(prediction => {
            if (prediction.class === 'person') {
              return prediction.score > 0.3;
            }
            return false;
          })
          .map(prediction => ({
            class: prediction.class,
            score: prediction.score,
            bbox: prediction.bbox,
          }));
      } catch (error) {
        throw error;
      }
    }
    return [];
  }

  // Method to check if model is ready
  isReady(): boolean {
    return this.isModelLoaded && this.faceApiModelsLoaded;
  }

  // Add detection result to history
  private addDetectionToHistory(
    hasBeard: boolean,
    personDetected: boolean
  ): void {
    const now = Date.now();

    // Add new detection
    this.beardDetectionHistory.push({
      timestamp: now,
      hasBeard,
      personDetected,
    });

    // Clean up old detections (older than 30 seconds)
    this.beardDetectionHistory = this.beardDetectionHistory.filter(
      detection => now - detection.timestamp <= this.BEARD_VOTING_WINDOW
    );
  }

  // Reset detection history when person detection stops
  private resetDetectionHistory(): void {
    this.beardDetectionHistory = [];
  }

  // Get beard detection result based on voting from last 30 seconds
  private getVotedBeardDetection(): {
    hasBeard: boolean;
    confidence: number;
  } {
    const now = Date.now();

    // Filter detections from last 30 seconds where person was detected
    const recentPersonDetections = this.beardDetectionHistory.filter(
      detection =>
        now - detection.timestamp <= this.BEARD_VOTING_WINDOW &&
        detection.personDetected
    );

    if (recentPersonDetections.length === 0) {
      return { hasBeard: false, confidence: 0 };
    }

    // Calculate percentage of detections that found beard
    const beardDetections = recentPersonDetections.filter(
      d => d.hasBeard
    ).length;
    const beardPercentage = beardDetections / recentPersonDetections.length;

    // If at least 25% of detections say beard, then person has beard
    const hasBeard = beardPercentage >= this.BEARD_VOTING_THRESHOLD;

    return {
      hasBeard,
      confidence: beardPercentage,
    };
  }

  // Load face-api.js models
  private async loadFaceApiModels(): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      if (typeof window === 'undefined') {
        this.faceApiModelsLoaded = false;
        return;
      }

      const faceApiModule = await import('@vladmandic/face-api');
      this.faceapi = faceApiModule.default || faceApiModule;
      const faceapi = this.faceapi;

      const MODEL_URL = '/models'; // path to the models in the public folder

      // Ensure TensorFlow.js is ready for face-api.js
      await tf.ready();

      // Load models sequentially to avoid conflicts
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

      // Add a small delay to ensure models are fully initialized
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify models are actually loaded
      if (
        faceapi.nets.tinyFaceDetector.isLoaded &&
        faceapi.nets.faceLandmark68Net.isLoaded
      ) {
        this.faceApiModelsLoaded = true;
      } else {
        throw new Error('Models loaded but not properly initialized');
      }
    } catch (error) {
      console.error('Error loading face-api.js models:', error);
      // Don't throw error, just mark as not loaded so fallback can be used
      this.faceApiModelsLoaded = false;
    }
  }

  // Check for beard using face landmarks
  private checkForBeard(landmarks: any): boolean {
    try {
      // Get jawline landmarks (points 0-16) and mouth landmarks (points 48-67)
      const jawline = landmarks.getJawOutline();
      const mouth = landmarks.getMouth();

      // Calculate the area between jawline and mouth to detect beard
      // Beard typically appears in the lower third of the face
      const jawlineBottom = Math.max(...jawline.map((point: any) => point.y));
      const mouthTop = Math.min(...mouth.map((point: any) => point.y));

      // Calculate the vertical distance between mouth and jawline
      const mouthToJawDistance = jawlineBottom - mouthTop;

      // Simple threshold for beard detection
      const hasBeard = mouthToJawDistance < 60;

      return hasBeard;
    } catch (error) {
      console.error('Error in beard detection:', error);
      return false;
    }
  }

  // Method specifically for beard detection using face-api.js with voting system
  async detectBeard(imageData: string): Promise<{
    personDetected: boolean;
    beardDetected: boolean;
    personValue: number;
  }> {
    try {
      // First check if face-api.js models are loaded
      if (!this.faceApiModelsLoaded) {
        return await this.detectBeardFallback(imageData);
      }

      // Additional check to ensure face-api.js is properly initialized
      if (
        !this.faceapi ||
        !this.faceapi.nets.tinyFaceDetector.isLoaded ||
        !this.faceapi.nets.faceLandmark68Net.isLoaded
      ) {
        return await this.detectBeardFallback(imageData);
      }

      // Create image element from base64 data
      const img = await this.createImageElement(imageData);

      // Use face-api.js to detect face and landmarks
      let detections = null;
      try {
        // Try different detection options
        const detectionOptions = new this.faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.1, // Lower threshold for better detection
        });

        // Try multiple detection methods
        detections = await this.faceapi
          .detectSingleFace(img, detectionOptions)
          .withFaceLandmarks();

        // If no face detected, try detectAllFaces
        if (!detections) {
          const allFaces = await this.faceapi
            .detectAllFaces(img, detectionOptions)
            .withFaceLandmarks();

          if (allFaces && allFaces.length > 0) {
            detections = allFaces[0]; // Use the first face
          }
        }
      } catch (faceApiError) {
        console.error('Face-api.js detection error:', faceApiError);
        // Fall through to COCO-SSD fallback
      }

      let personDetected = false;
      let currentBeardDetected = false;

      if (detections) {
        personDetected = true;
        // Use face landmarks to detect beard
        try {
          currentBeardDetected = this.checkForBeard(detections.landmarks);
        } catch (landmarkError) {
          console.error('Error in landmark analysis:', landmarkError);
          currentBeardDetected = false;
        }
      } else {
        // Fallback to COCO-SSD for person detection
        const results = await this.detectObjects(imageData);
        personDetected = results.some(
          item => item.class === 'person' && item.score > 0.5
        );

        if (personDetected) {
          // Use fallback beard detection
          const fallbackResult = await this.detectBeardFallback(imageData);
          currentBeardDetected = fallbackResult.beardDetected;
        }
      }

      // Check if person detection just stopped (transition from detected to not detected)
      const wasPersonDetected =
        this.beardDetectionHistory.length > 0 &&
        this.beardDetectionHistory[this.beardDetectionHistory.length - 1]
          .personDetected;

      if (wasPersonDetected && !personDetected) {
        this.resetDetectionHistory();
      }

      // Add current detection to history
      this.addDetectionToHistory(currentBeardDetected, personDetected);

      // Get voted beard detection result
      const votedResult = this.getVotedBeardDetection();
      const beardDetected = votedResult.hasBeard;

      let personValue = 0; // No person detected
      if (personDetected) {
        personValue = beardDetected ? 2 : 1; // 1 = person with beard, 2 = person without beard
      }

      return {
        personDetected,
        beardDetected,
        personValue,
      };
    } catch (error) {
      console.error('Face-api beard detection failed:', error);
      // Fallback to COCO-SSD detection
      return await this.detectBeardFallback(imageData);
    }
  }

  // Fallback method using COCO-SSD for beard detection
  private async detectBeardFallback(imageData: string): Promise<{
    personDetected: boolean;
    beardDetected: boolean;
    personValue: number;
  }> {
    try {
      const results = await this.detectObjects(imageData);

      // Look for person detection
      const personDetected = results.some(
        item => item.class === 'person' && item.score > 0.5
      );

      let beardDetected = false;

      if (personDetected) {
        // Try to detect beard using a simple image analysis approach
        beardDetected = await this.detectBeardInImage(imageData);

        // Fallback: If detection fails, use a simple heuristic based on image characteristics
        if (!beardDetected) {
          beardDetected = await this.detectBeardFallbackImage(imageData);
        }
      }

      let personValue = 0; // No person detected
      if (personDetected) {
        personValue = beardDetected ? 2 : 1; // 1 = person with beard, 2 = person without beard
      }

      return {
        personDetected,
        beardDetected,
        personValue,
      };
    } catch (error) {
      console.error('Fallback beard detection failed:', error);
      return {
        personDetected: false,
        beardDetected: false,
        personValue: 0,
      };
    }
  }

  // Enhanced beard detection using multiple image analysis techniques
  private async detectBeardInImage(imageData: string): Promise<boolean> {
    try {
      const img = await this.createImageElement(imageData);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData_ctx = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData_ctx.data;

      // Focus on lower half of image for beard detection
      const lowerHalfStart = Math.floor(pixels.length / 2);
      let darkPixelCount = 0;
      let totalPixels = 0;

      // Analyze lower half of image
      for (let i = lowerHalfStart; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        totalPixels++;

        // Count dark pixels (potential beard)
        if (brightness < 80) {
          darkPixelCount++;
        }
      }

      // Calculate ratio of dark pixels in lower half
      const darkPixelRatio = darkPixelCount / totalPixels;

      // Beard detection threshold
      const hasBeard = darkPixelRatio > 0.15;

      return hasBeard;
    } catch (error) {
      console.error('Beard image analysis failed:', error);
      return false;
    }
  }

  // Simple fallback beard detection
  private async detectBeardFallbackImage(imageData: string): Promise<boolean> {
    try {
      const img = await this.createImageElement(imageData);

      // Simple heuristic: check if the image has certain characteristics
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

      // Focus on lower half of image for beard detection
      const lowerHalfPixels = Math.floor(totalPixels / 2);
      let lowerHalfDarkPixels = 0;

      for (let i = pixels.length / 2; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness < 80) {
          lowerHalfDarkPixels++;
        }
      }

      const lowerHalfDarkRatio = lowerHalfDarkPixels / lowerHalfPixels;
      const hasBeard = lowerHalfDarkRatio > 0.15; // Higher threshold for beard detection

      return hasBeard;
    } catch (error) {
      console.error('Fallback beard detection failed:', error);
      return false;
    }
  }

  private async createImageElement(
    imageData: string
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
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
}
