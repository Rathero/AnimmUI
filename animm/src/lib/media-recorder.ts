import RecordRTC from 'recordrtc';
import GIF from 'gif.js';

export interface RecordingConfig {
  exportId: string;
  duration: number; // in milliseconds
  fps: number;
  format: 'gif' | 'webm' | 'mp4';
  quality?: number; // 1-30 for GIF, 0-1 for video
  width?: number;
  height?: number;
  bitrate?: number; // for video formats
}

export interface RecordingResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
  format: string;
  size: number;
  duration: number;
}

export interface RecordingStatus {
  isRecording: boolean;
  progress: number; // 0-100
  currentTime: number; // milliseconds
  totalFrames: number;
}

class MediaRecorder {
  private isRecording = false;
  private recorder: RecordRTC | null = null;
  private gifRecorder: GIF | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private recordingInterval: NodeJS.Timeout | null = null;
  private recordingTimeout: NodeJS.Timeout | null = null;
  private resolvePromise: ((result: RecordingResult) => void) | null = null;
  private statusCallback: ((status: RecordingStatus) => void) | null = null;
  private startTime: number = 0;
  private frameCount: number = 0;

  async startRecording(
    config: RecordingConfig,
    onStatusUpdate?: (status: RecordingStatus) => void
  ): Promise<RecordingResult> {
    if (this.isRecording) {
      return {
        success: false,
        error: 'Recording already in progress',
        format: config.format,
        size: 0,
        duration: 0,
      };
    }

    this.cleanup();
    this.statusCallback = onStatusUpdate || null;

    // Find the canvas element
    this.canvas = document.querySelector(
      '#MainCanvas canvas'
    ) as HTMLCanvasElement;
    if (!this.canvas) {
      return {
        success: false,
        error: 'Canvas element not found',
        format: config.format,
        size: 0,
        duration: 0,
      };
    }

    // Ensure Rive animation is stopped and ready to start
    await this.prepareRiveAnimation();

    if (config.format === 'gif') {
      return this.startGifRecording(config);
    } else {
      return this.startVideoRecording(config);
    }
  }

  private async prepareRiveAnimation(): Promise<void> {
    const riveInstance = (window as any).__RIVE_INSTANCE__;
    if (
      riveInstance &&
      typeof riveInstance.stop === 'function' &&
      typeof riveInstance.play === 'function'
    ) {
      try {
        // Stop the animation first to ensure it's at the beginning
        riveInstance.stop();

        // Wait a small amount of time to ensure the stop command is processed
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('Rive animation prepared and stopped');
      } catch (error) {
        console.warn('Could not prepare Rive animation:', error);
      }
    }
  }

  private startRiveAnimation(): void {
    const riveInstance = (window as any).__RIVE_INSTANCE__;
    if (riveInstance && typeof riveInstance.play === 'function') {
      try {
        riveInstance.play('SM');
        console.log('Rive animation started');
      } catch (error) {
        console.warn('Could not start Rive animation:', error);
      }
    }
  }

  private async startGifRecording(
    config: RecordingConfig
  ): Promise<RecordingResult> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;
      this.startTime = Date.now();
      this.frameCount = 0;

      // Create new GIF instance
      this.gifRecorder = new GIF({
        workers: 2,
        quality: config.quality || 10,
        width: config.width || this.canvas!.width,
        height: config.height || this.canvas!.height,
        workerScript: '/gif.worker.js', // We'll need to add this file
      });

      // Set up GIF event handlers
      this.gifRecorder.on('finished', (blob: Blob) => {
        console.log('GIF recording finished');
        this.isRecording = false;

        blob
          .arrayBuffer()
          .then(buffer => {
            const uint8Array = new Uint8Array(buffer);
            const result: RecordingResult = {
              success: true,
              data: uint8Array,
              format: 'gif',
              size: uint8Array.length,
              duration: config.duration,
            };
            console.log(
              `GIF created successfully, size: ${uint8Array.length} bytes`
            );
            resolve(result);
            this.cleanup();
          })
          .catch(error => {
            console.error('Error converting GIF blob to array buffer:', error);
            resolve({
              success: false,
              error: error.message,
              format: 'gif',
              size: 0,
              duration: config.duration,
            });
            this.cleanup();
          });
      });

      this.gifRecorder.on('progress', (progress: number) => {
        console.log(`GIF rendering progress: ${progress * 100}%`);
      });

      // Start capturing frames
      const frameInterval = 1000 / config.fps;
      let elapsedTime = 0;
      let isFirstFrame = true;

      this.recordingInterval = setInterval(() => {
        if (elapsedTime >= config.duration) {
          console.log(
            `GIF recording duration reached (${elapsedTime}ms >= ${config.duration}ms), stopping...`
          );
          this.stopRecording();
          return;
        }

        // Start Rive animation on the first frame to ensure perfect synchronization
        if (isFirstFrame) {
          this.startRiveAnimation();
          isFirstFrame = false;
        }

        try {
          this.gifRecorder!.addFrame(this.canvas!, { delay: frameInterval });
          elapsedTime += frameInterval;
          this.frameCount++;

          // Update status
          if (this.statusCallback) {
            const progress = Math.min(
              (elapsedTime / config.duration) * 100,
              100
            );
            this.statusCallback({
              isRecording: true,
              progress,
              currentTime: elapsedTime,
              totalFrames: this.frameCount,
            });
          }
        } catch (error) {
          console.error('Error capturing GIF frame:', error);
        }
      }, frameInterval);

      // Add timeout to prevent infinite recording
      this.recordingTimeout = setTimeout(() => {
        if (this.isRecording) {
          console.warn('GIF recording timeout, stopping...');
          this.stopRecording();
        }
      }, config.duration + 5000);

      console.log(
        `Started GIF recording: ${config.duration}ms, ${config.fps}fps`
      );
    });
  }

  private async startVideoRecording(
    config: RecordingConfig
  ): Promise<RecordingResult> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;
      this.startTime = Date.now();

      try {
        // Get canvas stream
        const stream = this.canvas!.captureStream(config.fps);

        // Configure recorder options
        const recorderOptions: any = {
          type: config.format === 'webm' ? 'video' : 'video',
          mimeType:
            config.format === 'webm' ? 'video/webm;codecs=vp9' : 'video/mp4',
          frameRate: config.fps,
          quality: config.quality || 0.8,
        };

        if (config.bitrate) {
          recorderOptions.videoBitsPerSecond = config.bitrate;
        }

        // Create recorder
        this.recorder = new RecordRTC(stream, recorderOptions);

        // Start recording
        this.recorder.startRecording();

        // Start Rive animation immediately after recording starts
        this.startRiveAnimation();

        // Set up status updates
        let elapsedTime = 0;
        this.recordingInterval = setInterval(() => {
          elapsedTime = Date.now() - this.startTime;

          if (elapsedTime >= config.duration) {
            console.log(
              `Video recording duration reached (${elapsedTime}ms >= ${config.duration}ms), stopping...`
            );
            this.stopRecording();
            return;
          }

          // Update status
          if (this.statusCallback) {
            const progress = Math.min(
              (elapsedTime / config.duration) * 100,
              100
            );
            this.statusCallback({
              isRecording: true,
              progress,
              currentTime: elapsedTime,
              totalFrames: Math.floor((elapsedTime / 1000) * config.fps),
            });
          }
        }, 100); // Update status every 100ms

        // Add timeout
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.warn('Video recording timeout, stopping...');
            this.stopRecording();
          }
        }, config.duration + 5000);

        console.log(
          `Started video recording: ${config.duration}ms, ${config.fps}fps, format: ${config.format}`
        );
      } catch (error) {
        console.error('Error starting video recording:', error);
        resolve({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to start video recording',
          format: config.format,
          size: 0,
          duration: config.duration,
        });
        this.cleanup();
      }
    });
  }

  stopRecording(): void {
    if (!this.isRecording) {
      console.log('Recording already stopped');
      return;
    }

    console.log('Stopping recording...');

    // Clear intervals and timeouts
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }

    this.isRecording = false;

    // Handle different recording types
    if (this.gifRecorder) {
      try {
        console.log('Rendering GIF...');
        this.gifRecorder.render();
      } catch (error) {
        console.error('Error rendering GIF:', error);
        if (this.resolvePromise) {
          this.resolvePromise({
            success: false,
            error:
              error instanceof Error ? error.message : 'GIF rendering failed',
            format: 'gif',
            size: 0,
            duration: Date.now() - this.startTime,
          });
          this.resolvePromise = null;
        }
      }
    } else if (this.recorder) {
      try {
        this.recorder.stopRecording(() => {
          const blob = this.recorder!.getBlob();
          const format = blob.type.includes('webm') ? 'webm' : 'mp4';

          blob
            .arrayBuffer()
            .then(buffer => {
              const uint8Array = new Uint8Array(buffer);
              const result: RecordingResult = {
                success: true,
                data: uint8Array,
                format,
                size: uint8Array.length,
                duration: Date.now() - this.startTime,
              };
              console.log(
                `${format.toUpperCase()} created successfully, size: ${
                  uint8Array.length
                } bytes`
              );

              if (this.resolvePromise) {
                this.resolvePromise(result);
                this.resolvePromise = null;
              }
              this.cleanup();
            })
            .catch(error => {
              console.error(
                `Error converting ${format} blob to array buffer:`,
                error
              );
              if (this.resolvePromise) {
                this.resolvePromise({
                  success: false,
                  error: error.message,
                  format,
                  size: 0,
                  duration: Date.now() - this.startTime,
                });
                this.resolvePromise = null;
              }
              this.cleanup();
            });
        });
      } catch (error) {
        console.error('Error stopping video recording:', error);
        if (this.resolvePromise) {
          this.resolvePromise({
            success: false,
            error:
              error instanceof Error ? error.message : 'Video recording failed',
            format: 'unknown',
            size: 0,
            duration: Date.now() - this.startTime,
          });
          this.resolvePromise = null;
        }
        this.cleanup();
      }
    }
  }

  private cleanup(): void {
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    this.recorder = null;
    this.gifRecorder = null;
    this.canvas = null;
    this.statusCallback = null;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  getCurrentStatus(): RecordingStatus {
    if (!this.isRecording) {
      return {
        isRecording: false,
        progress: 0,
        currentTime: 0,
        totalFrames: 0,
      };
    }

    const currentTime = Date.now() - this.startTime;
    return {
      isRecording: true,
      progress: 0, // Will be calculated by the recording process
      currentTime,
      totalFrames: this.frameCount,
    };
  }
}

// Create singleton instance
const mediaRecorder = new MediaRecorder();

// Export the singleton
export { mediaRecorder };
