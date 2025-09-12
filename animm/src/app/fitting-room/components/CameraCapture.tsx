'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Loader2, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  isActive: boolean;
  onDetection: (imageData: string) => void;
  isDetecting: boolean;
  onRealTimeDetection?: (imageData: string) => void;
}

export function CameraCapture({
  isActive,
  onDetection,
  isDetecting,
  onRealTimeDetection,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      stopRealTimeDetection();
    };
  }, [isActive]);

  useEffect(() => {
    if (isActive && isRealTimeMode && onRealTimeDetection) {
      startRealTimeDetection();
    } else {
      stopRealTimeDetection();
    }

    return () => {
      stopRealTimeDetection();
    };
  }, [isActive, isRealTimeMode, onRealTimeDetection]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(
        'Unable to access camera. Please check permissions and try again.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopRealTimeDetection();
  };

  const startRealTimeDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Run detection every 500ms for real-time analysis
    detectionIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && onRealTimeDetection) {
        captureFrameForRealTime();
      }
    }, 500);
  };

  const stopRealTimeDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const captureFrameForRealTime = () => {
    if (!videoRef.current || !canvasRef.current || !onRealTimeDetection) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onRealTimeDetection(imageData);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onDetection(imageData);
  };

  const handleCapture = () => {
    if (isDetecting) return;
    captureFrame();
  };

  if (!isActive) {
    return (
      <Card className="aspect-video flex items-center justify-center bg-muted">
        <div className="text-center space-y-4">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Camera is not active</p>
          <p className="text-sm text-muted-foreground">
            Click "Start Camera" to begin
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="aspect-video relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {isDetecting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Analyzing...</p>
            </div>
          </div>
        )}
        {isRealTimeMode && !isDetecting && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live Detection
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="text-center text-red-600 p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Camera Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-2">
        <Button
          onClick={() => setIsRealTimeMode(!isRealTimeMode)}
          disabled={!!error}
          variant={isRealTimeMode ? 'default' : 'outline'}
          className="w-full"
          size="lg"
        >
          {isRealTimeMode ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Real-time Detection ON
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Start Real-time Detection
            </>
          )}
        </Button>

        {!isRealTimeMode && (
          <Button
            onClick={handleCapture}
            disabled={isDetecting || !!error}
            variant="secondary"
            className="w-full"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Single Capture
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
