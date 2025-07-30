import GIF from 'gif.js';

export interface GifRecordingConfig {
  exportId: string;
  duration: number; // in milliseconds
  fps: number;
  quality?: number; // 1-30, lower is better quality
  width?: number;
  height?: number;
}

export interface GifRecordingResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
}

class GifRecorder {
  private isRecording = false;
  private gif: GIF | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private recordingInterval: NodeJS.Timeout | null = null;
  private recordingTimeout: NodeJS.Timeout | null = null;
  private resolvePromise: ((result: GifRecordingResult) => void) | null = null;

  async startRecording(
    config: GifRecordingConfig
  ): Promise<GifRecordingResult> {
    if (this.isRecording) {
      return { success: false, error: 'Recording already in progress' };
    }

    // Find the canvas element
    this.canvas = document.querySelector(
      '#MainCanvas canvas'
    ) as HTMLCanvasElement;
    if (!this.canvas) {
      return { success: false, error: 'Canvas element not found' };
    }

    // Create new GIF instance
    this.gif = new GIF({
      workers: 2,
      quality: config.quality || 10,
      width: config.width || this.canvas.width,
      height: config.height || this.canvas.height,
    });

    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;

      // Set up GIF event handlers
      this.gif!.on('finished', (blob: Blob) => {
        this.isRecording = false;
        this.cleanup();

        // Convert blob to Uint8Array
        blob
          .arrayBuffer()
          .then(buffer => {
            const uint8Array = new Uint8Array(buffer);
            resolve({ success: true, data: uint8Array });
          })
          .catch(error => {
            resolve({ success: false, error: error.message });
          });
      });
      /*
      this.gif!.on('error', (error: Error) => {
        this.isRecording = false;
        this.cleanup();
        resolve({ success: false, error: error.message });
      });
*/
      // Start capturing frames
      const frameInterval = 1000 / config.fps;
      let elapsedTime = 0;
      let frameCount = 0;

      this.recordingInterval = setInterval(() => {
        if (elapsedTime >= config.duration) {
          this.stopRecording();
          return;
        }

        // Capture current frame
        try {
          this.gif!.addFrame(this.canvas!, { delay: frameInterval });
          elapsedTime += frameInterval;
          frameCount++;
        } catch (error) {
          console.error('Error capturing frame:', error);
          // If we get too many errors, stop recording
          if (frameCount > 0 && frameCount % 10 === 0) {
            console.error('Too many frame capture errors, stopping recording');
            this.stopRecording();
            resolve({
              success: false,
              error: 'Frame capture failed repeatedly',
            });
          }
        }
      }, frameInterval);

      // Add a timeout to prevent infinite recording
      this.recordingTimeout = setTimeout(() => {
        if (this.isRecording) {
          console.warn('GIF recording timeout, stopping...');
          this.stopRecording();
          resolve({ success: false, error: 'Recording timeout' });
        }
      }, config.duration + 10000); // 10 seconds extra buffer

      // Start the Rive animation if available
      const riveInstance = (window as any).__RIVE_INSTANCE__;
      if (riveInstance) {
        riveInstance.play('SM');
      }

      console.log(
        `Started GIF recording: ${config.duration}ms, ${config.fps}fps`
      );
    });
  }

  stopRecording(): void {
    if (!this.isRecording || !this.gif) {
      return;
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    console.log('Stopping GIF recording...');
    this.gif.render();
  }

  private cleanup(): void {
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    this.gif = null;
    this.canvas = null;
    this.recordingInterval = null;
    this.resolvePromise = null;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

// Create singleton instance
const gifRecorder = new GifRecorder();

// Export the singleton
export { gifRecorder };
