'use client';

import { useState } from 'react';
import {
  RecordingConfig,
  RecordingResult,
  RecordingStatus,
} from '@/lib/media-recorder';

export default function RecordingTestPage() {
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus | null>(null);
  const [recordingResult, setRecordingResult] =
    useState<RecordingResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const testConfigs: RecordingConfig[] = [
    {
      exportId: 'test-gif-precise-1s',
      duration: 1000, // 1 second - exact duration test
      fps: 10,
      format: 'gif',
      quality: 10,
    },
    {
      exportId: 'test-gif-1',
      duration: 3000, // 3 seconds
      fps: 10,
      format: 'gif',
      quality: 10,
    },
    {
      exportId: 'test-gif-high-fps',
      duration: 2000, // 2 seconds with high FPS
      fps: 30,
      format: 'gif',
      quality: 10,
    },
    {
      exportId: 'test-webm-1',
      duration: 5000, // 5 seconds
      fps: 30,
      format: 'webm',
      quality: 0.8,
      bitrate: 4000000,
    },
    {
      exportId: 'test-mp4-1',
      duration: 4000, // 4 seconds
      fps: 30,
      format: 'mp4',
      quality: 0.8,
      bitrate: 4000000,
    },
  ];

  const startRecording = async (config: RecordingConfig) => {
    if (!(window as any).startRecording) {
      alert(
        'Recording functions not available. Please navigate to a viewer page first.'
      );
      return;
    }

    setIsRecording(true);
    setRecordingResult(null);
    setRecordingStatus(null);

    try {
      const result = await (window as any).startRecording(
        config,
        (status: RecordingStatus) => {
          setRecordingStatus(status);
        }
      );

      setRecordingResult(result);
      setIsRecording(false);

      if (result.success) {
        console.log(
          `Recording completed: ${result.size} bytes, requested: ${config.duration}ms, actual: ${result.duration}ms`
        );

        // Optionally save to API
        if (result.data) {
          await saveToAPI(result, config);
        }
      } else {
        console.error('Recording failed:', result.error);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const saveToAPI = async (
    result: RecordingResult,
    config: RecordingConfig
  ) => {
    try {
      const formData = new FormData();
      const blob = new Blob([result.data!], { type: `image/${result.format}` });
      formData.append('file', blob, `recording.${result.format}`);
      formData.append('exportId', config.exportId);
      formData.append('format', result.format);
      formData.append('duration', result.duration.toString());
      formData.append('fps', config.fps.toString());

      const response = await fetch('/api/recording/save', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const apiResult = await response.json();
        console.log('Saved to API:', apiResult);
        alert(`Recording saved successfully! Size: ${result.size} bytes`);
      } else {
        console.error('Failed to save to API:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving to API:', error);
    }
  };

  const stopRecording = () => {
    if ((window as any).stopRecording) {
      (window as any).stopRecording();
      setIsRecording(false);
    }
  };

  const clearResult = () => {
    if ((window as any).clearRecordingResult) {
      (window as any).clearRecordingResult();
    }
    setRecordingResult(null);
    setRecordingStatus(null);
  };

  const startRiveAnimation = () => {
    if ((window as any).startRiveAnimation) {
      (window as any).startRiveAnimation();
    } else {
      alert(
        'Rive animation control not available. Please navigate to a viewer page first.'
      );
    }
  };

  const stopRiveAnimation = () => {
    if ((window as any).stopRiveAnimation) {
      (window as any).stopRiveAnimation();
    } else {
      alert(
        'Rive animation control not available. Please navigate to a viewer page first.'
      );
    }
  };

  const downloadRecording = () => {
    if (recordingResult?.success && recordingResult.data) {
      const blob = new Blob([recordingResult.data], {
        type: recordingResult.format === 'gif' ? 'image/gif' : 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording.${recordingResult.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Recording API Test Page</h1>

      <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-800">
          <strong>Note:</strong> This page tests the recording API. For actual
          recording, navigate to a viewer page first (e.g.,{' '}
          <code>/viewer/[id]</code>) where the canvas is available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {testConfigs.map((config, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">
              {config.format.toUpperCase()} Recording
            </h3>
            <div className="text-sm text-gray-600 mb-4">
              <p>Duration: {config.duration}ms</p>
              <p>FPS: {config.fps}</p>
              <p>Quality: {config.quality}</p>
              {config.bitrate && <p>Bitrate: {config.bitrate / 1000000}Mbps</p>}
            </div>
            <button
              onClick={() => startRecording(config)}
              disabled={isRecording}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {isRecording
                ? 'Recording...'
                : `Start ${config.format.toUpperCase()}`}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Panel */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Recording Status</h3>
          {recordingStatus ? (
            <div className="space-y-2">
              <p>
                <strong>Recording:</strong>{' '}
                {recordingStatus.isRecording ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Progress:</strong> {recordingStatus.progress.toFixed(1)}
                %
              </p>
              <p>
                <strong>Time:</strong> {recordingStatus.currentTime}ms
              </p>
              <p>
                <strong>Frames:</strong> {recordingStatus.totalFrames}
              </p>
              {recordingStatus.isRecording && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${recordingStatus.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No recording in progress</p>
          )}

          <div className="mt-4 space-x-2">
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              Stop Recording
            </button>
            <button
              onClick={clearResult}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Clear Result
            </button>
          </div>

          {/* Rive Animation Controls */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2">Rive Animation Control</h4>
            <div className="space-x-2">
              <button
                onClick={startRiveAnimation}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Start Animation
              </button>
              <button
                onClick={stopRiveAnimation}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Stop Animation
              </button>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Recording Result</h3>
          {recordingResult ? (
            <div className="space-y-2">
              <p>
                <strong>Success:</strong>{' '}
                {recordingResult.success ? 'Yes' : 'No'}
              </p>
              {recordingResult.success ? (
                <>
                  <p>
                    <strong>Format:</strong> {recordingResult.format}
                  </p>
                  <p>
                    <strong>Size:</strong>{' '}
                    {recordingResult.size.toLocaleString()} bytes
                  </p>
                  <p>
                    <strong>Duration:</strong> {recordingResult.duration}ms
                  </p>
                  <button
                    onClick={downloadRecording}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Download Recording
                  </button>
                </>
              ) : (
                <p className="text-red-600">
                  <strong>Error:</strong> {recordingResult.error}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No result available</p>
          )}
        </div>
      </div>

      {/* Function Availability Check */}
      <div className="mt-8 border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Function Availability</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>startRecording:</strong>{' '}
            {typeof (window as any).startRecording === 'function' ? '✅' : '❌'}
          </div>
          <div>
            <strong>isRecording:</strong>{' '}
            {typeof (window as any).isRecording === 'function' ? '✅' : '❌'}
          </div>
          <div>
            <strong>getRecordingResult:</strong>{' '}
            {typeof (window as any).getRecordingResult === 'function'
              ? '✅'
              : '❌'}
          </div>
          <div>
            <strong>stopRecording:</strong>{' '}
            {typeof (window as any).stopRecording === 'function' ? '✅' : '❌'}
          </div>
          <div>
            <strong>startRiveAnimation:</strong>{' '}
            {typeof (window as any).startRiveAnimation === 'function'
              ? '✅'
              : '❌'}
          </div>
          <div>
            <strong>stopRiveAnimation:</strong>{' '}
            {typeof (window as any).stopRiveAnimation === 'function'
              ? '✅'
              : '❌'}
          </div>
          <div>
            <strong>__RIVE_INSTANCE__:</strong>{' '}
            {(window as any).__RIVE_INSTANCE__ ? '✅' : '❌'}
          </div>
        </div>
      </div>
    </div>
  );
}
