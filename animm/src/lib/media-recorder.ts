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
        // Start the Rive animation
        if (this.riveInstance && typeof this.riveInstance.play === 'function') {
          this.riveInstance.play('SM');
        }

        // Get canvas stream with optimized settings for 60fps
        const stream = this.canvas!.captureStream(30); // Force 60fps

        // Configure MediaRecorder for optimal 60fps recording
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
        navigator.mediaDevices.getUserMedia({
          video: {
            frameRate: {
              min: 60, // 😲 this constraint fixed an issue
              ideal: 60,
              max: 60,
            },
          },
        });
        const recorderOptions: any = {
          mimeType: selectedMimeType,
          videoBitsPerSecond: config.bitrate || 6000000, // Higher bitrate for 60fps
        };

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

  private startStatusUpdates(config: RecordingConfig): void {
    /*this.statusInterval = setInterval(() => {
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
    }, 100); // Update every 100ms for smooth progress*/
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
  }
}

// Create singleton instance
const mediaRecorder = new MediaRecorder();

// Export the singleton
export { mediaRecorder };

/*
Usage Examples:

1. Basic 60fps recording:
   const result = await mediaRecorder.startRecording({
     exportId: 'test-export',
     duration: 5000, // 5 seconds
     fps: 60,
     format: 'webm',
     bitrate: 12000000 // Higher bitrate for 60fps
   });

2. 60fps recording with status updates:
   const result = await mediaRecorder.startRecording(
     {
       exportId: 'test-export',
       duration: 10000, // 10 seconds
       fps: 60,
       format: 'mp4',
       bitrate: 15000000
     },
     (status) => {
     }
   );

3. High quality 60fps recording:
   const result = await mediaRecorder.startRecording({
     exportId: 'test-export',
     duration: 3000, // 3 seconds
     fps: 60,
     format: 'webm',
     bitrate: 20000000, // Very high bitrate for best quality
     quality: 1
   });

Key improvements:
- Simplified API with single recording method
- Forces 60fps using canvas.captureStream(60)
- Higher default bitrate (12Mbps) for 60fps quality
- Removed complex frame control logic
- Uses native MediaRecorder API for best performance
- Cleaner error handling and status updates
*/
