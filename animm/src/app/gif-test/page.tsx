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

  const handleStartRecording = async () => {
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
            4. Listen for: <code>gifRecordingComplete</code> event
          </p>
          <p>5. Extract GIF data from event detail</p>
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
    </div>
  );
}
