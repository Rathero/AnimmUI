'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, RotateCcw, Loader2 } from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { ObjectDetectionResults } from './components/ObjectDetectionResults';
import { ClothingAnalysis } from './components/ClothingAnalysis';
import { DetectionService } from './services/DetectionService';

export default function FittingRoomPage() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [clothingAnalysis, setClothingAnalysis] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [lastDetectedItems, setLastDetectedItems] = useState<string>('');
  const detectionService = useRef<DetectionService | null>(null);

  useEffect(() => {
    const initializeDetection = async () => {
      try {
        detectionService.current = new DetectionService();
        await detectionService.current.initialize();
        setIsModelLoading(false);
        // Automatically start camera after model loads
        setIsCameraActive(true);
      } catch (error) {
        console.error('Failed to initialize detection service:', error);
        setIsModelLoading(false);
      }
    };

    initializeDetection();
  }, []);

  const handleDetection = async (imageData: string) => {
    if (!detectionService.current) return;

    setIsDetecting(true);
    try {
      const results = await detectionService.current.detectObjects(imageData);
      setDetectionResults(results);

      // Enhanced analysis for clothing items
      const clothingItems = results.filter(item =>
        ['person', 'tie', 'handbag', 'backpack', 'suitcase'].includes(
          item.class
        )
      );

      if (clothingItems.length > 0) {
        const analysis = await detectionService.current.analyzeClothing(
          imageData,
          clothingItems
        );
        setClothingAnalysis(analysis);
      }
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRealTimeDetection = async (imageData: string) => {
    if (!detectionService.current) return;

    try {
      const results = await detectionService.current.detectObjects(imageData);
      setDetectionResults(results);

      // Filter clothing items
      const clothingItems = results.filter(item =>
        ['person', 'tie', 'handbag', 'backpack', 'suitcase'].includes(
          item.class
        )
      );

      // Create a signature of detected items to check if anything changed
      const currentItemsSignature = clothingItems
        .map(item => `${item.class}-${Math.round(item.score * 100)}`)
        .sort()
        .join('|');

      // Only update analysis if clothing items have changed
      if (
        clothingItems.length > 0 &&
        currentItemsSignature !== lastDetectedItems
      ) {
        const analysis = await detectionService.current.analyzeClothing(
          imageData,
          clothingItems
        );
        setClothingAnalysis(analysis);
        setLastDetectedItems(currentItemsSignature);
      } else if (clothingItems.length === 0) {
        // Clear analysis if no clothing items detected
        setClothingAnalysis(null);
        setLastDetectedItems('');
      }
    } catch (error) {
      console.error('Real-time detection failed:', error);
    }
  };

  if (isModelLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold">Loading AI Models...</h2>
            <p className="text-muted-foreground">
              Initializing TensorFlow.js and object detection models
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Virtual Fitting Room</h1>
        <p className="text-muted-foreground">
          Use your camera to detect and analyze clothing items with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Detection System
            </CardTitle>
            <CardDescription>
              Automatic real-time clothing detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CameraCapture
              isActive={isCameraActive}
              onDetection={handleDetection}
              isDetecting={isDetecting}
              onRealTimeDetection={handleRealTimeDetection}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDetectionResults([]);
                  setClothingAnalysis(null);
                  setLastDetectedItems('');
                }}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detection Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>
              Objects detected in the current frame
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ObjectDetectionResults
              results={detectionResults}
              isDetecting={isDetecting}
            />
          </CardContent>
        </Card>
      </div>

      {/* Clothing Analysis */}
      {clothingAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Clothing Analysis</CardTitle>
            <CardDescription>
              Detailed analysis of detected clothing items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClothingAnalysis analysis={clothingAnalysis} />
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <Badge variant="outline">1</Badge>
            <p>Camera and detection start automatically when the page loads</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline">2</Badge>
            <p>
              Position yourself in front of the camera wearing clothing you want
              to analyze
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline">3</Badge>
            <p>Analysis updates automatically when new clothing is detected</p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline">4</Badge>
            <p>
              View simplified analysis showing clothing type and dominant color
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
