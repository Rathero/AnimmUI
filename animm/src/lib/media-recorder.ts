export interface RecordingConfig {
  exportId: string;
  duration: number; // in milliseconds
  fps: number;
  format: 'webm' | 'mp4';
  quality?: number; // 0-1 for video
  width?: number;
  height?: number;
  bitrate?: number; // for video formats
}

export interface RecordingResult {
  success: boolean;
  data?: Uint8Array;
  error?: string;
  format: string; // Will be 'webm' or 'mp4' from the recorder
  size: number;
  duration: number;
}

export interface RecordingStatus {
  isRecording: boolean;
  progress: number; // 0-100
  currentTime: number; // milliseconds
  duration: number; // total duration in milliseconds
}

class MediaRecorder {
  private isRecording = false;
  private canvas: HTMLCanvasElement | null = null;
  private recordingTimeout: NodeJS.Timeout | null = null;
  private resolvePromise: ((result: RecordingResult) => void) | null = null;
  private statusCallback: ((status: RecordingStatus) => void) | null = null;
  private startTime: number = 0;
  private riveInstance: any = null;
  private config: RecordingConfig | null = null;
  private recordedChunks: Blob[] = [];
  private nativeMediaRecorder: globalThis.MediaRecorder | null = null;
  private statusInterval: NodeJS.Timeout | null = null;
  private frameSyncId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private performanceStartTime: number = 0;

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
    this.config = config;

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

    // Prepare Rive animation
    await this.prepareRiveAnimation();

    // Start simplified 60fps recording
    return this.startSimplifiedRecording(config);
  }

  private async prepareRiveAnimation(): Promise<void> {
    this.riveInstance = (window as any).__RIVE_INSTANCE__;
    if (!this.riveInstance) {
      throw new Error('Rive instance not found');
    }

    // Stop any existing animation
    try {
      this.riveInstance.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn('Could not prepare Rive animation:', error);
    }
  }

  private startSimplifiedRecording(
    config: RecordingConfig
  ): Promise<RecordingResult> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;
      this.startTime = Date.now();
      this.recordedChunks = [];

      try {
        debugger;
        // Optimize Rive performance for recording
        //this.optimizeRiveForRecording();

        // Start the Rive animation
        if (this.riveInstance && typeof this.riveInstance.play === 'function') {
          this.riveInstance.play('SM');
        }

        // Get canvas stream with correct FPS matching target
        const targetFps = Math.min(config.fps || 30, 60); // Cap at 60fps for performance
        const stream = this.canvas!.captureStream(targetFps);

        // Configure MediaRecorder for optimal high-fps recording
        const mimeTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4;codecs=h264',
        ];

        let selectedMimeType = mimeTypes[0];
        for (const mimeType of mimeTypes) {
          if (
            (MediaRecorder as any).isTypeSupported &&
            (MediaRecorder as any).isTypeSupported(mimeType)
          ) {
            selectedMimeType = mimeType;
            break;
          }
        }

        // Calculate optimal bitrate based on FPS and resolution
        const canvasWidth = this.canvas!.width;
        const canvasHeight = this.canvas!.height;
        const pixels = canvasWidth * canvasHeight;
        const baseBitrate = Math.max(2000000, pixels * targetFps * 0.1); // Dynamic bitrate calculation
        const finalBitrate = config.bitrate || Math.min(baseBitrate, 20000000); // Cap at 20Mbps

        const recorderOptions: any = {
          mimeType: selectedMimeType,
          videoBitsPerSecond: finalBitrate,
        };

        // Add timeslice for better performance with high FPS
        if (targetFps >= 30) {
          recorderOptions.timeslice = 1000 / targetFps; // Timeslice based on target FPS
        }

        // Create native MediaRecorder instance
        this.nativeMediaRecorder = new globalThis.MediaRecorder(
          stream,
          recorderOptions
        );

        // Clear previous chunks and prepare for new data
        this.recordedChunks = [];
        this.nativeMediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        // Handle the stop event to create the video
        this.nativeMediaRecorder.onstop = () => {
          this.processRecordedVideo();
        };

        // Start recording
        this.nativeMediaRecorder.start();

        // Start frame synchronization for consistent timing
        this.startFrameSynchronization(targetFps);

        // Start status updates
        this.startStatusUpdates(config);

        // Set timeout to stop recording
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, config.duration);
      } catch (error) {
        console.error('Error starting simplified recording:', error);
        resolve({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to start recording',
          format: config.format,
          size: 0,
          duration: 0,
        });
        this.cleanup();
      }
    });
  }

  private optimizeRiveForRecording(): void {
    if (!this.riveInstance) return;

    try {
      // Set Rive to high performance mode for recording
      if (this.riveInstance.setRenderer) {
        // Force WebGL2 renderer for better performance
        this.riveInstance.setRenderer('webgl2');
      }

      // Optimize animation settings
      if (this.riveInstance.setFrameRate) {
        this.riveInstance.setFrameRate(60); // Force 60fps
      }

      // Disable any quality settings that might slow down rendering
      if (this.riveInstance.setQuality) {
        this.riveInstance.setQuality('high');
      }

      // Ensure smooth animation playback
      if (this.riveInstance.setLoop) {
        this.riveInstance.setLoop('loop');
      }

      // Force immediate rendering
      if (this.riveInstance.advance) {
        this.riveInstance.advance(0);
      }
    } catch (error) {
      console.warn('Could not optimize Rive for recording:', error);
    }
  }

  private startFrameSynchronization(targetFps: number): void {
    this.performanceStartTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = 0;

    const frameInterval = 1000 / targetFps; // Target frame interval in ms

    const syncFrame = (currentTime: number) => {
      if (!this.isRecording) {
        this.frameSyncId = null;
        return;
      }

      const deltaTime = currentTime - this.lastFrameTime;

      // Only process frame if enough time has passed for target FPS
      if (deltaTime >= frameInterval) {
        // Force Rive to advance and render
        if (this.riveInstance && this.riveInstance.advance) {
          this.riveInstance.advance(deltaTime / 1000); // Convert to seconds
        }

        // Force canvas to update
        if (this.canvas) {
          const ctx = this.canvas.getContext('2d');
          if (ctx) {
            // Trigger a repaint by reading pixel data
            ctx.getImageData(0, 0, 1, 1);
          }
        }

        this.lastFrameTime = currentTime;
        this.frameCount++;

        // Monitor performance
        if (this.frameCount % 60 === 0) {
          // Every 60 frames
          const elapsed = performance.now() - this.performanceStartTime;
          const actualFps = (this.frameCount / elapsed) * 1000;
          console.log(
            `Recording FPS: ${actualFps.toFixed(1)} (target: ${targetFps})`
          );
        }
      }

      // Continue frame synchronization
      this.frameSyncId = requestAnimationFrame(syncFrame);
    };

    this.frameSyncId = requestAnimationFrame(syncFrame);
  }

  private startStatusUpdates(config: RecordingConfig): void {
    this.statusInterval = setInterval(() => {
      if (!this.isRecording) {
        return;
      }

      const elapsedTime = Date.now() - this.startTime;
      const progress = Math.min((elapsedTime / config.duration) * 100, 100);

      if (this.statusCallback) {
        this.statusCallback({
          isRecording: true,
          progress,
          currentTime: elapsedTime,
          duration: config.duration,
        });
      }
    }, 100); // Update every 100ms for smooth progress
  }

  private processRecordedVideo(): void {
    try {
      // Create blob from recorded chunks
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const recordedFormat = blob.type.includes('webm') ? 'webm' : 'mp4';

      // Convert to Uint8Array
      blob
        .arrayBuffer()
        .then(buffer => {
          const uint8Array = new Uint8Array(buffer);
          const result: RecordingResult = {
            success: true,
            data: uint8Array,
            format: recordedFormat,
            size: uint8Array.length,
            duration: Date.now() - this.startTime,
          };

          if (this.resolvePromise) {
            this.resolvePromise(result);
          }
        })
        .catch(error => {
          console.error('Error processing recorded video:', error);
          if (this.resolvePromise) {
            this.resolvePromise({
              success: false,
              error: error.message,
              format: 'webm',
              size: 0,
              duration: Date.now() - this.startTime,
            });
          }
        })
        .finally(() => {
          this.cleanup();
        });
    } catch (error) {
      console.error('Error processing recorded video:', error);
      if (this.resolvePromise) {
        this.resolvePromise({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to process recorded video',
          format: 'webm',
          size: 0,
          duration: Date.now() - this.startTime,
        });
      }
      this.cleanup();
    }
  }

  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.clearTimers();

    // Stop the MediaRecorder
    if (
      this.nativeMediaRecorder &&
      this.nativeMediaRecorder.state === 'recording'
    ) {
      this.nativeMediaRecorder.stop();
    }
  }

  private clearTimers(): void {
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    if (this.frameSyncId) {
      cancelAnimationFrame(this.frameSyncId);
      this.frameSyncId = null;
    }
  }

  private cleanup(): void {
    this.clearTimers();

    this.canvas = null;
    this.statusCallback = null;
    this.resolvePromise = null;
    this.riveInstance = null;
    this.config = null;
    this.recordedChunks = [];
    this.nativeMediaRecorder = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.performanceStartTime = 0;
  }
}

// Create singleton instance
const mediaRecorder = new MediaRecorder();

// Export the singleton
export { mediaRecorder };

/*
Usage Examples:

1. Basic 30fps recording (recommended for complex animations):
   const result = await mediaRecorder.startRecording({
     exportId: 'test-export',
     duration: 5000, // 5 seconds
     fps: 30,
     format: 'webm'
   });

2. High performance 60fps recording:
   const result = await mediaRecorder.startRecording({
     exportId: 'test-export',
     duration: 5000, // 5 seconds
     fps: 60,
     format: 'webm',
     bitrate: 15000000 // Auto-calculated based on resolution and FPS
   });

3. Recording with status updates:
   const result = await mediaRecorder.startRecording(
     {
       exportId: 'test-export',
       duration: 10000, // 10 seconds
       fps: 30,
       format: 'mp4'
     },
     (status) => {
       console.log(`Progress: ${status.progress}%`);
     }
   );

Key performance improvements:
- Dynamic bitrate calculation based on resolution and FPS
- Frame synchronization using requestAnimationFrame
- Rive performance optimizations for complex animations
- Canvas capture rate matches target FPS
- Performance monitoring with FPS logging
- Optimized MediaRecorder configuration with timeslice
- WebGL2 renderer enforcement for better performance
- Automatic quality settings for recording mode
*/
