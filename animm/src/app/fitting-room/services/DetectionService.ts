import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class DetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isModelLoaded = false;
  private faceApiModelsLoaded = false;
  private faceapi: any = null;

  private beardDetectionHistory: Array<{
    timestamp: number;
    hasBeard: boolean;
    personDetected: boolean;
  }> = [];
  private readonly BEARD_VOTING_WINDOW = 30000;
  private readonly BEARD_VOTING_THRESHOLD = 0.25;

  async initialize(): Promise<void> {
    try {
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

      this.model = await cocoSsd.load();
      this.isModelLoaded = true;

      await this.loadFaceApiModels();
    } catch (error) {
      console.error('Failed to load COCO-SSD model:', error);
      throw error;
    }
  }

  async detectObjects(imageData: string): Promise<any[]> {
    if (this.isModelLoaded && this.model) {
      try {
        const imageElement = await this.createImageElement(imageData);
        const predictions = await this.model.detect(imageElement);

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

  isReady(): boolean {
    return this.isModelLoaded && this.faceApiModelsLoaded;
  }

  private addDetectionToHistory(
    hasBeard: boolean,
    personDetected: boolean
  ): void {
    const now = Date.now();

    this.beardDetectionHistory.push({
      timestamp: now,
      hasBeard,
      personDetected,
    });

    this.beardDetectionHistory = this.beardDetectionHistory.filter(
      detection => now - detection.timestamp <= this.BEARD_VOTING_WINDOW
    );
  }

  private resetDetectionHistory(): void {
    this.beardDetectionHistory = [];
  }

  private getVotedBeardDetection(): {
    hasBeard: boolean;
    confidence: number;
  } {
    const now = Date.now();

    const recentPersonDetections = this.beardDetectionHistory.filter(
      detection =>
        now - detection.timestamp <= this.BEARD_VOTING_WINDOW &&
        detection.personDetected
    );

    if (recentPersonDetections.length === 0) {
      return { hasBeard: false, confidence: 0 };
    }

    const beardDetections = recentPersonDetections.filter(
      d => d.hasBeard
    ).length;
    const beardPercentage = beardDetections / recentPersonDetections.length;

    console.log('beardPercentage', beardPercentage);
    const hasBeard = beardPercentage >= this.BEARD_VOTING_THRESHOLD;

    return {
      hasBeard,
      confidence: beardPercentage,
    };
  }

  private async loadFaceApiModels(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        this.faceApiModelsLoaded = false;
        return;
      }

      const faceApiModule = await import('@vladmandic/face-api');
      this.faceapi = faceApiModule.default || faceApiModule;
      const faceapi = this.faceapi;

      const MODEL_URL = '/models';

      await tf.ready();

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

      await new Promise(resolve => setTimeout(resolve, 200));

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
      this.faceApiModelsLoaded = false;
    }
  }

  private checkForBeard(landmarks: any): boolean {
    try {
      const jawline = landmarks.getJawOutline();
      const mouth = landmarks.getMouth();

      const jawlineBottom = Math.max(...jawline.map((point: any) => point.y));
      const mouthTop = Math.min(...mouth.map((point: any) => point.y));

      const mouthToJawDistance = jawlineBottom - mouthTop;

      console.log('mouthToJawDistance', mouthToJawDistance);
      console.log('jawlineBottom', mouthTop);
      console.log('jawlineBottom', mouthTop);
      const hasBeard = mouthToJawDistance < 65;

      return hasBeard;
    } catch (error) {
      console.error('Error in beard detection:', error);
      return false;
    }
  }

  async detectBeard(imageData: string): Promise<{
    personDetected: boolean;
    beardDetected: boolean;
    personValue: number;
  }> {
    try {
      if (!this.faceApiModelsLoaded) {
        return await this.detectBeardFallback(imageData);
      }

      if (
        !this.faceapi ||
        !this.faceapi.nets.tinyFaceDetector.isLoaded ||
        !this.faceapi.nets.faceLandmark68Net.isLoaded
      ) {
        return await this.detectBeardFallback(imageData);
      }

      const img = await this.createImageElement(imageData);

      let detections = null;
      try {
        const detectionOptions = new this.faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.1,
        });

        detections = await this.faceapi
          .detectSingleFace(img, detectionOptions)
          .withFaceLandmarks();

        if (!detections) {
          const allFaces = await this.faceapi
            .detectAllFaces(img, detectionOptions)
            .withFaceLandmarks();

          if (allFaces && allFaces.length > 0) {
            detections = allFaces[0];
          }
        }
      } catch (faceApiError) {
        console.error('Face-api.js detection error:', faceApiError);
      }

      let personDetected = false;
      let currentBeardDetected = false;

      if (detections) {
        const results = await this.detectObjects(imageData);
        personDetected = results.some(
          item => item.class === 'person' && item.score > 0.5
        );
        try {
          currentBeardDetected = this.checkForBeard(detections.landmarks);
        } catch (landmarkError) {
          console.error('Error in landmark analysis:', landmarkError);
          currentBeardDetected = false;
        }
      } else {
        const results = await this.detectObjects(imageData);
        personDetected = results.some(
          item => item.class === 'person' && item.score > 0.5
        );

        if (personDetected) {
          const fallbackResult = await this.detectBeardFallback(imageData);
          currentBeardDetected = fallbackResult.beardDetected;
        }
      }

      const wasPersonDetected =
        this.beardDetectionHistory.length > 0 &&
        this.beardDetectionHistory[this.beardDetectionHistory.length - 1]
          .personDetected;

      if (wasPersonDetected && !personDetected) {
        this.resetDetectionHistory();
      }

      this.addDetectionToHistory(currentBeardDetected, personDetected);

      const votedResult = this.getVotedBeardDetection();
      const beardDetected = votedResult.hasBeard;

      let personValue = 0;
      if (personDetected) {
        personValue = beardDetected ? 2 : 1;
      }

      return {
        personDetected,
        beardDetected,
        personValue,
      };
    } catch (error) {
      console.error('Face-api beard detection failed:', error);
      return await this.detectBeardFallback(imageData);
    }
  }

  private async detectBeardFallback(imageData: string): Promise<{
    personDetected: boolean;
    beardDetected: boolean;
    personValue: number;
  }> {
    try {
      const results = await this.detectObjects(imageData);

      const personDetected = results.some(
        item => item.class === 'person' && item.score > 0.5
      );

      let beardDetected = false;

      if (personDetected) {
        beardDetected = await this.detectBeardInImage(imageData);

        if (!beardDetected) {
          beardDetected = await this.detectBeardFallbackImage(imageData);
        }
      }

      let personValue = 0;
      if (personDetected) {
        personValue = beardDetected ? 2 : 1;
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

  private async detectBeardInImage(imageData: string): Promise<boolean> {
    try {
      const img = await this.createImageElement(imageData);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData_ctx = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData_ctx.data;

      const lowerHalfStart = Math.floor(pixels.length / 2);
      let darkPixelCount = 0;
      let totalPixels = 0;

      for (let i = lowerHalfStart; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        totalPixels++;

        if (brightness < 80) {
          darkPixelCount++;
        }
      }

      const darkPixelRatio = darkPixelCount / totalPixels;

      const hasBeard = darkPixelRatio > 0.15;

      return hasBeard;
    } catch (error) {
      console.error('Beard image analysis failed:', error);
      return false;
    }
  }

  private async detectBeardFallbackImage(imageData: string): Promise<boolean> {
    try {
      const img = await this.createImageElement(imageData);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData_ctx = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData_ctx.data;

      let totalPixels = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r + g + b) / 3;

        totalPixels++;
      }

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
      const hasBeard = lowerHalfDarkRatio > 0.15;

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
      img.crossOrigin = 'anonymous';
      img.src = imageData;
    });
  }
}
