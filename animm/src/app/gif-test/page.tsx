'use client';

import { useState, useEffect, useRef } from 'react';
import { gifRecorder, GifRecordingConfig } from '@/lib/gif-recorder';

export default function GifTestPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create a simple animation for testing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw a moving circle
      const x = 100 + Math.sin(frame * 0.1) * 50;
      const y = 100 + Math.cos(frame * 0.1) * 50;

      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Draw some text
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.fillText(`Frame: ${frame}`, 10, 30);

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // Expose global functions for testing (same as in viewer page)
  useEffect(() => {
    // Store the recording result globally for .NET to poll
    (window as any).__GIF_RECORDING_RESULT__ = null;
    (window as any).__GIF_RECORDING_IN_PROGRESS__ = false;

    // Make the GIF recording function available globally
    (window as any).startGifRecording = async (config: GifRecordingConfig) => {
      try {
        console.log('Starting GIF recording from .NET:', config);

        // Set recording in progress
        (window as any).__GIF_RECORDING_IN_PROGRESS__ = true;
        (window as any).__GIF_RECORDING_RESULT__ = null;

        const result = await gifRecorder.startRecording(config);

        // Store the result globally for .NET to poll
        (window as any).__GIF_RECORDING_RESULT__ = result;
        (window as any).__GIF_RECORDING_IN_PROGRESS__ = false;

        return result;
      } catch (error) {
        console.error('Error in GIF recording:', error);
        const errorResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        // Store the error result
        (window as any).__GIF_RECORDING_RESULT__ = errorResult;
        (window as any).__GIF_RECORDING_IN_PROGRESS__ = false;

        return errorResult;
      }
    };

    // Also expose a function to check if recording is in progress
    (window as any).isGifRecording = () => {
      return (
        gifRecorder.isCurrentlyRecording() ||
        (window as any).__GIF_RECORDING_IN_PROGRESS__
      );
    };

    // Function to get the recording result (for .NET to poll)
    (window as any).getGifRecordingResult = () => {
      return (window as any).__GIF_RECORDING_RESULT__;
    };

    // Function to clear the recording result
    (window as any).clearGifRecordingResult = () => {
      (window as any).__GIF_RECORDING_RESULT__ = null;
      (window as any).__GIF_RECORDING_IN_PROGRESS__ = false;
    };

    // Cleanup function
    return () => {
      delete (window as any).startGifRecording;
      delete (window as any).isGifRecording;
      delete (window as any).getGifRecordingResult;
      delete (window as any).clearGifRecordingResult;
      delete (window as any).__GIF_RECORDING_RESULT__;
      delete (window as any).__GIF_RECORDING_IN_PROGRESS__;
    };
  }, []);

  const handleStartRecording = async () => {
    if (isRecording) {
      setResult('Recording already in progress');
      return;
    }

    setIsRecording(true);
    setResult('');

    const config: GifRecordingConfig = {
      exportId: 'test-123',
      duration: 3000, // 3 seconds
      fps: 10,
      quality: 10,
    };

    try {
      const recordingResult = await gifRecorder.startRecording(config);

      // Update global state for polling
      (window as any).__GIF_RECORDING_RESULT__ = recordingResult;
      (window as any).__GIF_RECORDING_IN_PROGRESS__ = false;

      if (recordingResult.success && recordingResult.data) {
        setResult(
          `Recording successful! GIF size: ${recordingResult.data.length} bytes`
        );

        // Create a download link
        const blob = new Blob([recordingResult.data], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test.gif';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setResult(`Recording failed: ${recordingResult.error}`);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // Update global state for polling
      (window as any).__GIF_RECORDING_RESULT__ = errorResult;
      (window as any).__GIF_RECORDING_IN_PROGRESS__ = false;

      setResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">GIF Recording Test</h1>

      {/* Test Canvas */}
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="border border-gray-300 rounded"
          id="MainCanvas"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isRecording ? 'Recording...' : 'Start GIF Recording (3s, 10fps)'}
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Result:</h2>
          <p>{result}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">How to use from .NET:</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm">
          <p>
            1. Navigate to viewer page: <code>/viewer/{'{exportId}'}</code>
          </p>
          <p>2. Wait for page to load</p>
          <p>
            3. Call: <code>window.startGifRecording(config)</code>
          </p>
          <p>
            4. Poll: <code>window.getGifRecordingResult()</code>
          </p>
          <p>5. Extract GIF data from result</p>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">
          Test the Polling Mechanism:
        </h2>
        <div className="bg-blue-50 p-4 rounded">
          <button
            onClick={() => {
              const result = (window as any).getGifRecordingResult();
              console.log('Current recording result:', result);
              if (result) {
                alert(
                  `Recording Result:\nSuccess: ${result.success}\n${
                    result.success
                      ? `Data size: ${result.data?.length || 0} bytes`
                      : `Error: ${result.error}`
                  }`
                );
              } else {
                alert(
                  'No recording result available yet. Start a recording first!'
                );
              }
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Check Recording Result
          </button>
          <button
            onClick={() => {
              const isRecording = (window as any).isGifRecording();
              console.log('Is recording:', isRecording);
              alert(`Recording in progress: ${isRecording ? 'Yes' : 'No'}`);
            }}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm ml-2"
          >
            Check Recording Status
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>This page includes a simple animated canvas for testing</li>
          <li>Click the button to start a 3-second GIF recording</li>
          <li>The GIF will be automatically downloaded when complete</li>
          <li>Check the browser console for detailed logging</li>
        </ul>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <div className="bg-yellow-50 p-4 rounded text-sm">
          <p>
            <strong>Global State:</strong>
          </p>
          <p>
            Recording in progress:{' '}
            {typeof window !== 'undefined' &&
            (window as any).__GIF_RECORDING_IN_PROGRESS__
              ? 'Yes'
              : 'No'}
          </p>
          <p>
            Has result:{' '}
            {typeof window !== 'undefined' &&
            (window as any).__GIF_RECORDING_RESULT__
              ? 'Yes'
              : 'No'}
          </p>
          <p>
            GIF Recorder state:{' '}
            {gifRecorder.isCurrentlyRecording() ? 'Recording' : 'Idle'}
          </p>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log(
                'Global recording in progress:',
                (window as any).__GIF_RECORDING_IN_PROGRESS__
              );
              console.log(
                'Global result:',
                (window as any).__GIF_RECORDING_RESULT__
              );
              console.log(
                'GIF recorder state:',
                gifRecorder.isCurrentlyRecording()
              );
              console.log(
                'Canvas found:',
                !!document.querySelector('#MainCanvas')
              );
              console.log('==================');
            }}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-xs mt-2"
          >
            Log Debug Info
          </button>
        </div>
      </div>
    </div>
  );
}
