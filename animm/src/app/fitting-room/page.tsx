'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileAsset, Rive } from '@rive-app/react-webgl2';
import { DetectionService } from './services/DetectionService';
import RiveComp from '@/components/editor/rive-component';
import { VariableStringSetter } from '@/components/editor/variable-string-setter';
import {
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';

export default function FittingRoomPage() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);
  const [functionsToSetNumbers, setFunctionsToSetNumbers] = useState<
    Array<{ x: number; f: (x: number) => void }>
  >([]);
  const detectionService = useRef<DetectionService | null>(null);
  const lastDetectionTime = useRef<number>(0);
  const detectionThrottle = 500; // Throttle detection to every 500ms

  // Shared values for frame processing (inspired by Vision Camera)
  const personValue = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);
  const frameQueue = useRef<string[]>([]);
  const maxQueueSize = 3; // Limit queue size for performance

  // Throttled FPS processing (like Vision Camera's runAtTargetFps)
  const TARGET_FPS = 2; // Process at 2 FPS for better performance
  const lastProcessTime = useRef<number>(0);
  const fpsInterval = 1000 / TARGET_FPS;

  // Debug mode for testing glasses detection
  const [debugMode, setDebugMode] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [manualPersonValue, setManualPersonValue] = useState(0);

  // Create a mock Person variable for Rive
  const personVariable: TemplateVariable = {
    id: 999,
    value: 'Product ID',
    type: TemplateVariableTypeEnum.Selector,
    name: 'Product ID',
    section: '',
    possibleValues: [
      { value: '0', label: 'No Person' },
      { value: '1', label: 'Person with Glasses' },
      { value: '2', label: 'Person without Glasses' },
    ],
    defaultValue: '0',
    paths: [],
  };

  useEffect(() => {
    if (
      rivesStates &&
      rivesStates.length > 0 &&
      functionsToSetNumbers &&
      functionsToSetNumbers.length > 0 &&
      !initialized
    ) {
      console.log('initializing detection');
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        mainCan.style.width = window.innerWidth + 'px';
        mainCan.style.height = window.innerHeight + 'px';
      }

      const initializeDetection = async () => {
        try {
          detectionService.current = new DetectionService();
          await detectionService.current.initialize();
          setIsModelLoading(false);
          // Start real-time detection for glasses
          startRealTimeDetection(functionsToSetNumbers);
          setInitialized(true);
        } catch (error) {
          //console.error('Failed to initialize detection service:', error);
          setIsModelLoading(false);
        }
      };

      initializeDetection();
    }
  }, [rivesStates, functionsToSetNumbers]);

  const startRealTimeDetection = (
    functionsToSetNumbers: Array<{ x: number; f: (x: number) => void }>
  ) => {
    // Set up camera for real-time detection
    // NOTE: Current glasses detection uses a basic image analysis heuristic
    // For production, consider using a specialized glasses detection model like:
    // - MediaPipe Face Detection + custom glasses classifier
    // - TensorFlow.js with a pre-trained glasses detection model
    // - Face-api.js with glasses detection capabilities
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Vision Camera-inspired frame processor
        const frameProcessor = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            const imageData = canvas.toDataURL('image/jpeg');

            // Add frame to queue (like Vision Camera's frame processing)
            if (frameQueue.current.length < maxQueueSize) {
              frameQueue.current.push(imageData);
            }

            // Process frames asynchronously (like Vision Camera's runAsync)
            if (!isProcessing.current && frameQueue.current.length > 0) {
              processFrameQueue(functionsToSetNumbers);
            }
          }
          requestAnimationFrame(frameProcessor);
        };

        video.addEventListener('loadeddata', frameProcessor);
      })
      .catch(error => {
        //console.error('Error accessing camera:', error);
      });
  };

  // Process frame queue asynchronously (inspired by Vision Camera's runAsync)
  const processFrameQueue = async (
    functionsToSetNumbers: Array<{ x: number; f: (x: number) => void }>
  ) => {
    if (isProcessing.current || frameQueue.current.length === 0) return;

    // Throttle processing to target FPS (like Vision Camera's runAtTargetFps)
    const now = Date.now();
    if (now - lastProcessTime.current < fpsInterval) {
      return;
    }
    lastProcessTime.current = now;

    isProcessing.current = true;

    try {
      const imageData = frameQueue.current.shift();
      if (imageData) {
        await handleGlassesDetection(imageData, functionsToSetNumbers);
      }
    } finally {
      isProcessing.current = false;

      // Continue processing if there are more frames
      if (frameQueue.current.length > 0) {
        // Use setTimeout to allow other tasks to run (like Vision Camera's async processing)
        setTimeout(() => processFrameQueue(functionsToSetNumbers), 0);
      }
    }
  };

  const handleGlassesDetection = async (
    imageData: string,
    functionsToSetNumbers: Array<{ x: number; f: (x: number) => void }>
  ) => {
    if (!detectionService.current) return;

    // Throttle detection to avoid too frequent updates
    const now = Date.now();
    if (now - lastDetectionTime.current < detectionThrottle) {
      return;
    }
    lastDetectionTime.current = now;

    try {
      let newPersonValue: number;

      if (debugMode) {
        // Use manual value for testing
        newPersonValue = manualPersonValue;
        //console.log('Debug mode - using manual value:', newPersonValue);
      } else {
        // Use actual detection
        const detection = await detectionService.current.detectGlasses(
          imageData
        );
        newPersonValue = detection.personValue;

        // Log detection results for debugging
        //console.log('Glasses detection:', {
        //  personDetected: detection.personDetected,
        //  glassesDetected: detection.glassesDetected,
        //  personValue: newPersonValue,
        //});
      }
      // Only update if value changed (performance optimization)
      if (personValue.current !== newPersonValue) {
        console.log('previous value', personValue.current);
        personValue.current = newPersonValue;
        console.log('sending value', newPersonValue);
        // Send value to Rive
        setPersonValue(newPersonValue, functionsToSetNumbers);
      }
    } catch (error) {
      //console.error('Glasses detection failed:', error);
    }
  };

  const setPersonValue = (
    value: number,
    functionsToSetNumbers: Array<{ x: number; f: (x: number) => void }>
  ) => {
    functionsToSetNumbers.forEach(x => {
      if (x.x === personVariable.id) {
        x.f(value);
      }
    });
  };

  return (
    <div className="h-full w-full" id="MainCanvas">
      {/* Full-screen Rive animation */}
      <RiveComp
        src="https://animmfilesv2.blob.core.windows.net/riv/demo/nedap_fitting_room.riv"
        setAssetsParent={setAssets}
        setRiveStatesParent={setRiveStates}
        autoplay={true}
        artboard="Template"
      />

      {/* Variable setter for Person detection */}
      {rivesStates.length > 0 && (
        <VariableStringSetter
          variable={personVariable}
          rive={rivesStates[0]}
          onSetFunctionString={() => {}}
          onSetFunctionBoolean={() => {}}
          onSetFunctionNumber={setValueFunction => {
            setFunctionsToSetNumbers(prev => [
              { x: personVariable.id, f: setValueFunction },
              ...prev,
            ]);
          }}
        />
      )}
    </div>
  );
}
