import RecordRTC from 'recordrtc';

export interface RecordingConfig {
  exportId: string;
  duration: number; // in milliseconds
  fps: number;
  format: 'gif' | 'webm' | 'mp4';
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
  totalFrames: number;
}

class MediaRecorder {
  private isRecording = false;
  private recorder: RecordRTC | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private recordingInterval: NodeJS.Timeout | null = null;
  private recordingTimeout: NodeJS.Timeout | null = null;
  private resolvePromise: ((result: RecordingResult) => void) | null = null;
  private statusCallback: ((status: RecordingStatus) => void) | null = null;
  private startTime: number = 0;
  private animationFrameId: number | null = null;
  private riveInstance: any = null;
  private renderer: any = null;
  private artboard: any = null;
  private stateMachine: any = null;
  private animation: any = null;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private totalFrames: number = 0;
  private frameInterval: number = 0;

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

    // Prepare Rive animation and get instance
    await this.prepareRiveAnimation();

    // Calculate frame timing
    this.frameInterval = 1000 / config.fps; // milliseconds between frames
    this.totalFrames = Math.ceil((config.duration / 1000) * config.fps);

    // Start custom frame capture recording
    return this.startCustomFrameRecording(config);
  }

  private async prepareRiveAnimation(): Promise<void> {
    this.riveInstance = (window as any).__RIVE_INSTANCE__;
    if (!this.riveInstance) {
      throw new Error('Rive instance not found');
    }

    // Get the internal Rive components
    this.renderer = this.riveInstance.renderer;
    this.artboard = this.riveInstance.artboard;
    this.stateMachine = this.riveInstance.stateMachine;
    this.animation = this.riveInstance.animation;

    if (!this.renderer || !this.artboard) {
      throw new Error('Rive renderer or artboard not available');
    }

    // Stop any existing animation
    try {
      this.riveInstance.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Rive animation prepared and stopped');
    } catch (error) {
      console.warn('Could not prepare Rive animation:', error);
    }
  }

  private startCustomFrameRecording(
    config: RecordingConfig
  ): Promise<RecordingResult> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;
      this.startTime = Date.now();
      this.frameCount = 0;
      this.lastTime = 0;

      try {
        // Create a MediaRecorder with a canvas stream (without FPS parameter for better browser compatibility)
        const stream = this.canvas!.captureStream();

        // Configure recorder options with proper frame rate settings
        // Try different MIME types for better FPS support
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

        const recorderOptions: any = {
          type: 'video',
          mimeType: selectedMimeType,
          frameRate: config.fps,
          videoBitsPerSecond: config.bitrate || 8000000, // Higher bitrate for better quality
          quality: config.quality || 1,
          disableLogs: true,
        };

        this.recorder = new RecordRTC(stream, recorderOptions);
        this.recorder.startRecording();

        console.log(
          `Recording started with MIME type: ${selectedMimeType}, FPS: ${config.fps}, Frame interval: ${this.frameInterval}ms`
        );

        // Start Rive animation and frame counting
        this.startRiveAnimationWithFrameControl();

        // Timeout to stop recording automatically (fallback)
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.log(
              `Recording timeout reached (${config.duration}ms), stopping...`
            );
            this.stopRecording();
          }
        }, config.duration); // Add 5 seconds buffer

        console.log(
          `Started frame-controlled recording: ${this.totalFrames} frames at ${config.fps}fps`
        );
      } catch (error) {
        console.error('Error starting frame-controlled recording:', error);
        resolve({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to start frame-controlled recording',
          format: 'webm',
          size: 0,
          duration: 0,
        });
        this.cleanup();
      }
    });
  }

  private startRiveAnimationWithFrameControl(): void {
    // Start the Rive animation normally
    if (this.riveInstance && typeof this.riveInstance.play === 'function') {
      try {
        this.riveInstance.play('SM');
        console.log('Rive animation started for recording');
      } catch (error) {
        console.warn('Could not start Rive animation:', error);
      }
    }

    // Use precise timing control for frame capture
    const frameIntervalMs = this.frameInterval; // Already in milliseconds
    let lastFrameTime = 0;
    let animationStartTime = 0;

    const frameLoop = (currentTime: number) => {
      if (!this.isRecording) {
        return;
      }

      // Initialize animation start time
      if (animationStartTime === 0) {
        animationStartTime = currentTime;
        lastFrameTime = currentTime;
      }

      // Calculate the exact time when the next frame should be captured
      const targetFrameTime =
        animationStartTime + this.frameCount * frameIntervalMs;

      // Only process frames when we've reached the target time
      if (currentTime >= targetFrameTime) {
        this.frameCount++;
        lastFrameTime = currentTime;

        // Force Rive to advance to the exact frame time for precise timing
        if (this.riveInstance && this.riveInstance.advance) {
          const frameTime = ((this.frameCount - 1) * frameIntervalMs) / 1000; // Convert to seconds
          this.riveInstance.advance(frameTime);
        }

        // Force canvas redraw to ensure frame is captured
        if (this.canvas && this.canvas.getContext) {
          const ctx = this.canvas.getContext('2d');
          if (ctx) {
            // Trigger a small redraw to ensure the frame is captured
            ctx.save();
            ctx.globalAlpha = 0.01;
            ctx.fillRect(0, 0, 1, 1);
            ctx.restore();
          }
        }

        // Update status
        if (this.statusCallback) {
          const progress = Math.min(
            (this.frameCount / this.totalFrames) * 100,
            100
          );
          const elapsedTime = Date.now() - this.startTime;
          this.statusCallback({
            isRecording: true,
            progress,
            currentTime: elapsedTime,
            totalFrames: this.totalFrames,
          });
        }

        // Check if we've captured all required frames
        if (this.frameCount >= this.totalFrames) {
          console.log(
            `Captured all ${this.totalFrames} frames, stopping recording`
          );
          this.stopRecording();
          return;
        }
      }

      // Continue the frame loop
      this.animationFrameId = requestAnimationFrame(frameLoop);
    };

    // Start the frame loop
    this.animationFrameId = requestAnimationFrame(frameLoop);
  }

  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    console.log('Stopping recording...');
    this.isRecording = false;
    this.clearTimers();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recorder) {
      this.recorder.stopRecording(() => {
        setTimeout(() => {
          const blob = this.recorder!.getBlob();
          const recordedFormat = blob.type.includes('webm') ? 'webm' : 'mp4';

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
              console.log(
                `${recordedFormat.toUpperCase()} created successfully, size: ${
                  uint8Array.length
                } bytes. Ready to send to backend.`
              );

              if (this.resolvePromise) {
                this.resolvePromise(result);
              }
            })
            .catch(error => {
              console.error(`Error processing blob:`, error);
              if (this.resolvePromise) {
                this.resolvePromise({
                  success: false,
                  error: error.message,
                  format: recordedFormat,
                  size: 0,
                  duration: Date.now() - this.startTime,
                });
              }
            })
            .finally(() => {
              this.cleanup();
            });
        }, 1000);
      });
    }
  }

  private clearTimers(): void {
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private cleanup(): void {
    this.clearTimers();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recorder) {
      this.recorder.destroy();
      this.recorder = null;
    }

    this.canvas = null;
    this.statusCallback = null;
    this.resolvePromise = null;
    this.riveInstance = null;
    this.renderer = null;
    this.artboard = null;
    this.stateMachine = null;
    this.animation = null;
    this.lastTime = 0;
    this.frameCount = 0;
    this.totalFrames = 0;
    this.frameInterval = 0;
  }
}

// Create singleton instance
const mediaRecorder = new MediaRecorder();

// Export the singleton
export { mediaRecorder };
