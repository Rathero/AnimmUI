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
  useFrameControl?: boolean; // Use Rive onAdvance callback for frame control
  totalFrames?: number; // Total frames to capture (alternative to duration)
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
  private frameCount: number = 0;
  private totalFrames: number = 0;
  private frameInterval: number = 0;
  private capturedFrames: ImageData[] = [];
  private config: RecordingConfig | null = null;
  private rendererCanvas: HTMLCanvasElement | null = null;
  private lastFrameData: Uint8ClampedArray | null = null;
  private frameCheckInterval: NodeJS.Timeout | null = null;

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

    // Prepare Rive animation and get instance
    await this.prepareRiveAnimation();

    // Calculate frame timing and total frames
    this.frameInterval = 1000 / config.fps; // milliseconds between frames
    this.totalFrames =
      config.totalFrames || Math.ceil((config.duration / 1000) * config.fps);

    // Choose recording method based on config
    if (config.useFrameControl) {
      return this.startFrameControlledRecording(config);
    } else {
      return this.startCustomFrameRecording(config);
    }
  }

  private async prepareRiveAnimation(): Promise<void> {
    this.riveInstance = (window as any).__RIVE_INSTANCE__;
    if (!this.riveInstance) {
      throw new Error('Rive instance not found');
    }

    // Get the internal Rive components
    this.renderer = this.riveInstance.renderer;
    this.artboard = this.riveInstance.artboard;

    if (!this.renderer || !this.artboard) {
      throw new Error('Rive renderer or artboard not available');
    }

    // Get the renderer's canvas element
    this.rendererCanvas = this.renderer.F;
    if (!this.rendererCanvas) {
      throw new Error('Rive renderer canvas not found');
    }

    console.log('Rive renderer canvas found:', this.rendererCanvas);

    // Stop any existing animation
    try {
      this.riveInstance.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Rive animation prepared and stopped');
    } catch (error) {
      console.warn('Could not prepare Rive animation:', error);
    }
  }

  private startFrameControlledRecording(
    config: RecordingConfig
  ): Promise<RecordingResult> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;
      this.startTime = Date.now();
      this.frameCount = 0;
      this.capturedFrames = [];

      try {
        // Start the Rive animation
        if (this.riveInstance && typeof this.riveInstance.play === 'function') {
          this.riveInstance.play('SM');
          console.log('Rive animation started for frame-controlled recording');
        }

        // Start frame capture using the renderer canvas
        this.startFrameCapture();

        // Set a generous timeout since we're now frame-based, not time-based
        // This is just a safety net in case something goes wrong
        const safetyTimeout = Math.max(60000, config.duration * 3); // At least 1 minute or 3x the original duration

        console.log(
          `Frame-based recording started with safety timeout: ${safetyTimeout}ms`
        );

        // Timeout fallback in case something goes wrong
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.log(
              `Frame-controlled recording safety timeout reached after ${safetyTimeout}ms, stopping...`
            );
            this.stopFrameControlledRecording();
          }
        }, safetyTimeout);

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

  private startFrameCapture(): void {
    if (!this.rendererCanvas || !this.isRecording) {
      return;
    }

    console.log('Starting frame change detection...');

    // Check for frame changes at high frequency (60fps) to detect when canvas updates
    const checkInterval = 1000 / 60; // Check 60 times per second

    const checkForFrameChange = () => {
      if (!this.isRecording || this.frameCount >= this.totalFrames) {
        if (this.frameCount >= this.totalFrames) {
          console.log(
            `Captured all ${this.totalFrames} frames, stopping recording`
          );
          this.stopFrameControlledRecording();
        }
        return;
      }

      try {
        // Get the current frame from the renderer canvas
        const ctx = this.rendererCanvas?.getContext('2d');
        if (!ctx || !this.rendererCanvas) {
          console.warn(
            'Could not get renderer canvas context for frame capture'
          );
          // Continue checking
          this.frameCheckInterval = setTimeout(
            checkForFrameChange,
            checkInterval
          );
          return;
        }

        // Get current frame data
        const imageData = ctx.getImageData(
          0,
          0,
          this.rendererCanvas.width,
          this.rendererCanvas.height
        );

        // Check if this frame is different from the last one
        const hasChanged = this.hasFrameChanged(imageData.data);

        if (hasChanged) {
          // Frame has changed, capture it
          this.capturedFrames.push(imageData);
          this.frameCount++;
          this.lastFrameData = new Uint8ClampedArray(imageData.data);

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

          console.log(
            `Captured frame ${this.frameCount}/${this.totalFrames} (canvas changed)`
          );
        }

        // Continue checking for changes
        this.frameCheckInterval = setTimeout(
          checkForFrameChange,
          checkInterval
        );
      } catch (error) {
        console.error('Error checking for frame changes:', error);
        // Continue checking even if one check fails
        this.frameCheckInterval = setTimeout(
          checkForFrameChange,
          checkInterval
        );
      }
    };

    // Start checking for frame changes
    checkForFrameChange();
  }

  private hasFrameChanged(currentFrameData: Uint8ClampedArray): boolean {
    if (!this.lastFrameData) {
      // First frame, always capture
      return true;
    }

    // Compare frame data to detect changes
    // For performance, we can sample pixels instead of comparing every pixel
    const sampleRate = Math.max(1, Math.floor(currentFrameData.length / 10000)); // Sample ~10k pixels

    for (let i = 0; i < currentFrameData.length; i += sampleRate) {
      if (currentFrameData[i] !== this.lastFrameData[i]) {
        return true; // Frame has changed
      }
    }

    return false; // No significant changes detected
  }

  private stopFrameControlledRecording(): void {
    if (!this.isRecording) {
      return;
    }

    console.log('Stopping frame-controlled recording...');
    this.isRecording = false;
    this.clearTimers();

    // Compile captured frames into video
    this.compileFramesToVideo();
  }

  private async compileFramesToVideo(): Promise<void> {
    if (!this.config || this.capturedFrames.length === 0) {
      if (this.resolvePromise) {
        this.resolvePromise({
          success: false,
          error: 'No frames captured or config missing',
          format: this.config?.format || 'webm',
          size: 0,
          duration: Date.now() - this.startTime,
        });
      }
      this.cleanup();
      return;
    }

    try {
      // Create a temporary canvas for frame compilation
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas!.width;
      tempCanvas.height = this.canvas!.height;
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) {
        throw new Error('Could not create temporary canvas context');
      }

      // Create a MediaRecorder stream from the temporary canvas
      const stream = tempCanvas.captureStream(this.config.fps);

      // Configure recorder options
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
        frameRate: this.config.fps,
        videoBitsPerSecond: this.config.bitrate || 8000000,
        quality: this.config.quality || 1,
        disableLogs: true,
      };

      this.recorder = new RecordRTC(stream, recorderOptions);
      this.recorder.startRecording();

      // Play back captured frames to the temporary canvas
      const frameInterval = 1000 / this.config.fps;
      let currentFrame = 0;

      const playFrame = () => {
        if (currentFrame >= this.capturedFrames.length) {
          // All frames played, stop recording
          setTimeout(() => {
            this.recorder!.stopRecording(() => {
              const blob = this.recorder!.getBlob();
              const recordedFormat = blob.type.includes('webm')
                ? 'webm'
                : 'mp4';

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
                    `${recordedFormat.toUpperCase()} created from ${
                      this.capturedFrames.length
                    } frames, size: ${uint8Array.length} bytes`
                  );

                  if (this.resolvePromise) {
                    this.resolvePromise(result);
                  }
                })
                .catch(error => {
                  console.error('Error processing compiled video:', error);
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
            });
          }, 1000);
          return;
        }

        // Draw the current frame to the temporary canvas
        tempCtx.putImageData(this.capturedFrames[currentFrame], 0, 0);
        currentFrame++;

        // Schedule next frame
        setTimeout(playFrame, frameInterval);
      };

      // Start playing frames
      playFrame();
    } catch (error) {
      console.error('Error compiling frames to video:', error);
      if (this.resolvePromise) {
        this.resolvePromise({
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to compile frames',
          format: this.config.format,
          size: 0,
          duration: Date.now() - this.startTime,
        });
      }
      this.cleanup();
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

      try {
        // Create a MediaRecorder with a canvas stream (without FPS parameter for better browser compatibility)
        const stream = this.canvas!.captureStream(config.fps);

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
    /*
    // Use precise timing control for frame capture
    const frameIntervalMs = this.frameInterval; // Already in milliseconds
    let lastFrameTime = 0;

    const frameLoop = (currentTime: number) => {
      if (!this.isRecording) {
        return;
      }

      this.frameCount++;
      lastFrameTime = currentTime;
      if (currentTime - lastFrameTime >= frameIntervalMs) {
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
    this.animationFrameId = requestAnimationFrame(frameLoop);*/
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
    if (this.frameCheckInterval) {
      clearTimeout(this.frameCheckInterval);
      this.frameCheckInterval = null;
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
    this.frameCount = 0;
    this.totalFrames = 0;
    this.frameInterval = 0;
    this.capturedFrames = [];
    this.config = null;
    this.rendererCanvas = null;
    this.lastFrameData = null;
    this.frameCheckInterval = null;
  }
}

// Create singleton instance
const mediaRecorder = new MediaRecorder();

// Export the singleton
export { mediaRecorder };

/*
Usage Examples:

1. Traditional time-based recording (existing approach):
   const result = await mediaRecorder.startRecording({
     exportId: 'test-export',
     duration: 5000, // 5 seconds
     fps: 30,
     format: 'webm',
     useFrameControl: false // or omit this property
   });

2. New frame-controlled recording using Rive's onAdvance callback:
   const result = await mediaRecorder.startRecording({
     exportId: 'test-export',
     duration: 5000, // fallback timeout
     fps: 30,
     format: 'webm',
     useFrameControl: true,
     totalFrames: 90 // Capture exactly 90 frames (3 seconds at 30fps)
   });

3. Frame-controlled recording with status updates:
   const result = await mediaRecorder.startRecording(
     {
       exportId: 'test-export',
       duration: 10000,
       fps: 60,
       format: 'mp4',
       useFrameControl: true,
       totalFrames: 300 // 5 seconds at 60fps
     },
     (status) => {
       console.log(`Recording progress: ${status.progress}%`);
       console.log(`Frames captured: ${status.currentTime}ms`);
     }
   );

The frame-controlled approach:
- Uses Rive's renderer CanvasRenderingContext2D to detect when frames actually change
- Captures frames only when the canvas content changes (not time-based)
- Provides true frame-based recording that matches the actual animation timing
- Captures frames as ImageData and compiles them into video
- Automatically stops when the specified number of frames is reached
- Uses frame difference detection for optimal performance
*/
