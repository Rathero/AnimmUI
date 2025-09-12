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
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);

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
      <Card className="flex items-center justify-center bg-muted p-6">
        <div className="text-center space-y-4">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Initializing camera...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden video element for camera access - completely hidden but functional */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '240px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999,
          transform: 'scale(0.1)',
          transformOrigin: 'top left',
        }}
      />

      {/* Status Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Camera Status</h3>
              <p className="text-sm text-muted-foreground">
                {error ? 'Camera Error' : 'Camera Active - Detection Running'}
              </p>
            </div>
          </div>

          {isRealTimeMode && !isDetecting && !error && (
            <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live Detection
            </div>
          )}

          {isDetecting && (
            <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              Analyzing
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              <AlertCircle className="h-3 w-3" />
              Error
            </div>
          )}
        </div>
      </Card>

      {/* Hidden canvas for image capture - completely hidden but functional */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '240px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999,
          transform: 'scale(0.1)',
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}
