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

    // Prepare Rive animation
    await this.prepareRiveAnimation();

    // Always record as a video stream for best performance
    return this.startVideoStreamRecording(config);
  }

  private async prepareRiveAnimation(): Promise<void> {
    const riveInstance = (window as any).__RIVE_INSTANCE__;
    if (
      riveInstance &&
      typeof riveInstance.stop === 'function' &&
      typeof riveInstance.play === 'function'
    ) {
      try {
        riveInstance.stop();
        await new Promise(resolve => setTimeout(resolve, 100)); // Ensure stop is processed
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

  private async startVideoStreamRecording(
    config: RecordingConfig
  ): Promise<RecordingResult> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      this.isRecording = true;
      this.startTime = Date.now();

      try {
        // Get canvas stream at the target FPS
        const stream = this.canvas!.captureStream(config.fps);

        // Configure recorder options for high-quality WEBM
        const recorderOptions: any = {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9', // VP9 is a high-quality codec
          frameRate: config.fps,
          quality: config.quality || 1, // Default to high quality
          disableLogs: true,
        };

        if (config.bitrate) {
          recorderOptions.videoBitsPerSecond = config.bitrate;
        }

        this.recorder = new RecordRTC(stream, recorderOptions);
        this.startRiveAnimation();
        this.recorder.startRecording();

        // Timeout to stop recording automatically
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.log(
              `Recording duration reached (${config.duration}ms), stopping...`
            );
            this.stopRecording();
          }
        }, config.duration);

        console.log(
          `Started video stream recording: ${config.duration}ms, ${config.fps}fps`
        );
      } catch (error) {
        console.error('Error starting video recording:', error);
        resolve({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to start video recording',
          format: 'webm',
          size: 0,
          duration: 0,
        });
        this.cleanup();
      }
    });
  }

  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    console.log('Stopping recording...');
    this.isRecording = false; // Prevent race conditions
    this.clearTimers();

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
        }, 1000); // 500ms delay is usually sufficient.
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
  }

  private cleanup(): void {
    this.clearTimers();
    if (this.recorder) {
      this.recorder.destroy();
      this.recorder = null;
    }
    this.canvas = null;
    this.statusCallback = null;
    this.resolvePromise = null;
  }
}

// Create singleton instance
const mediaRecorder = new MediaRecorder();

// Export the singleton
export { mediaRecorder };
