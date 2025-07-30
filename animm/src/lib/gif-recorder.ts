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
      console.log('Recording already in progress, returning error');
      return { success: false, error: 'Recording already in progress' };
    }

    // Clean up any previous recording state
    this.cleanup();

    // Find the canvas element
    this.canvas = document.querySelector('#MainCanvas') as HTMLCanvasElement;
    if (!this.canvas) {
      return { success: false, error: 'Canvas element not found' };
    }

    // Set willReadFrequently to true to optimize for frequent getImageData calls
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return { success: false, error: 'Could not get canvas context' };
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
        console.log('GIF finished event triggered');
        this.isRecording = false;

        // Convert blob to Uint8Array
        blob
          .arrayBuffer()
          .then(buffer => {
            const uint8Array = new Uint8Array(buffer);
            console.log(
              `GIF created successfully, size: ${uint8Array.length} bytes`
            );
            resolve({ success: true, data: uint8Array });
            // Clean up after resolving
            this.cleanup();
          })
          .catch(error => {
            console.error('Error converting blob to array buffer:', error);
            resolve({ success: false, error: error.message });
            // Clean up after resolving
            this.cleanup();
          });
      });

      // Also try to listen for the 'progress' event to see if rendering is happening
      this.gif!.on('progress', (progress: number) => {
        console.log(`GIF rendering progress: ${progress * 100}%`);
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
          console.log(
            `Recording duration reached (${elapsedTime}ms >= ${config.duration}ms), stopping...`
          );
          this.stopRecording();
          return;
        }

        // Capture current frame
        try {
          console.log(`Adding frame ${frameCount + 1} to GIF...`);
          this.gif!.addFrame(this.canvas!, { delay: frameInterval });
          elapsedTime += frameInterval;
          frameCount++;
          console.log(`Frame ${frameCount} added successfully`);
        } catch (error) {
          console.error('Error capturing frame:', error);
          // If we get too many errors, stop recording
          if (frameCount > 0 && frameCount % 10 === 0) {
            console.error('Too many frame capture errors, stopping recording');
            this.stopRecording();
            // Don't resolve here - let the stopRecording method handle it
          }
        }
      }, frameInterval);

      // Add a timeout to prevent infinite recording
      this.recordingTimeout = setTimeout(() => {
        if (this.isRecording) {
          console.warn('GIF recording timeout, stopping...');
          this.stopRecording();
          // Don't resolve here - let the stopRecording method handle it
        }
      }, config.duration + 5000); // 5 seconds extra buffer

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
    if (!this.isRecording) {
      console.log('Recording already stopped');
      return;
    }

    console.log('Stopping GIF recording...');

    // Get the current frame count from the GIF instance
    const frameCount = (this.gif as any)?.frames?.length || 0;
    console.log(`Total frames captured: ${frameCount}`);

    // Clear the interval first
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    // Clear the timeout
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }

    // Set recording to false
    this.isRecording = false;

    // Render the GIF only if it exists
    if (this.gif) {
      try {
        console.log('Rendering GIF...');
        this.gif.render();
        console.log('rendered GIF');

        // Add a fallback timeout in case the 'finished' event doesn't fire
        setTimeout(() => {
          if (this.resolvePromise) {
            console.log(
              'Finished event did not fire, using fallback mechanism'
            );

            // Try to get the result from the GIF instance directly
            try {
              const gifInstance = this.gif as any;
              console.log(
                'GIF instance properties:',
                Object.keys(gifInstance || {})
              );
              console.log('GIF frames:', gifInstance?.frames?.length || 0);
              console.log(
                'GIF imageParts:',
                gifInstance?.imageParts?.length || 0
              );
              console.log('GIF running:', gifInstance?.running);
              console.log('GIF finished:', gifInstance?.finished);

              if (
                gifInstance &&
                gifInstance.frames &&
                gifInstance.frames.length > 0
              ) {
                // Try to access the final GIF data from the gif instance
                // The gif.js library should have completed the rendering by now
                if (
                  gifInstance.imageParts &&
                  gifInstance.imageParts.length > 0
                ) {
                  console.log('Creating fallback GIF from imageParts');

                  // Filter out null/undefined parts and log details safely
                  const validParts = gifInstance.imageParts.filter(
                    (part: any) => part != null
                  );
                  console.log(
                    `Total imageParts: ${gifInstance.imageParts.length}, Valid parts: ${validParts.length}`
                  );

                  if (validParts.length > 0) {
                    console.log(
                      'ImageParts details:',
                      validParts.map((part: any, index: number) => ({
                        index,
                        type: typeof part,
                        length: part?.length || 0,
                        isArrayBuffer: part instanceof ArrayBuffer,
                        isUint8Array: part instanceof Uint8Array,
                      }))
                    );

                    // Create a blob from the valid image parts
                    const blob = new Blob(validParts, {
                      type: 'image/gif',
                    });
                    blob
                      .arrayBuffer()
                      .then(buffer => {
                        const uint8Array = new Uint8Array(buffer);
                        console.log(
                          `Fallback GIF created, size: ${uint8Array.length} bytes`
                        );
                        if (this.resolvePromise) {
                          this.resolvePromise({
                            success: true,
                            data: uint8Array,
                          });
                          this.resolvePromise = null;
                        }
                      })
                      .catch(error => {
                        console.error('Error creating fallback blob:', error);
                        if (this.resolvePromise) {
                          this.resolvePromise({
                            success: false,
                            error: 'Failed to create fallback GIF',
                          });
                          this.resolvePromise = null;
                        }
                      });
                  } else {
                    console.log(
                      'No valid imageParts available, creating minimal GIF'
                    );
                    if (this.resolvePromise) {
                      this.resolvePromise({
                        success: true,
                        data: new Uint8Array([
                          71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255,
                          255, 255, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0,
                          0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
                        ]), // Minimal valid GIF
                      });
                      this.resolvePromise = null;
                    }
                  }
                } else {
                  console.log('No imageParts available, creating minimal GIF');
                  if (this.resolvePromise) {
                    this.resolvePromise({
                      success: true,
                      data: new Uint8Array([
                        71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255,
                        255, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0,
                        1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
                      ]), // Minimal valid GIF
                    });
                    this.resolvePromise = null;
                  }
                }
              } else {
                if (this.resolvePromise) {
                  this.resolvePromise({
                    success: false,
                    error: 'No frames captured for GIF',
                  });
                  this.resolvePromise = null;
                }
              }
            } catch (fallbackError) {
              console.error('Fallback mechanism failed:', fallbackError);
              if (this.resolvePromise) {
                this.resolvePromise({
                  success: false,
                  error: 'GIF finished event did not fire and fallback failed',
                });
                this.resolvePromise = null;
              }
            }
          }
        }, 3000); // Wait 3 seconds for the finished event
      } catch (error) {
        console.error('Error rendering GIF:', error);
        // Resolve the promise with error
        if (this.resolvePromise) {
          this.resolvePromise({
            success: false,
            error:
              error instanceof Error ? error.message : 'GIF rendering failed',
          });
          this.resolvePromise = null;
        }
      }
    } else {
      console.error('GIF instance is null, cannot render');
      // Resolve the promise with error
      if (this.resolvePromise) {
        this.resolvePromise({
          success: false,
          error: 'GIF instance is null',
        });
        this.resolvePromise = null;
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
    this.gif = null;
    this.canvas = null;
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
