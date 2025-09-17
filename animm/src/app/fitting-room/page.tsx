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
  const detectionThrottle = 100; // Minimal throttle since we already process once per second

  // Shared values for frame processing (inspired by Vision Camera)
  const personValue = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);
  const frameQueue = useRef<string[]>([]);
  const maxQueueSize = 1; // Only keep 1 frame in queue for efficiency

  // Throttled FPS processing - process once per second for efficiency
  const TARGET_FPS = 1; // Process at 1 FPS (once per second)
  const lastProcessTime = useRef<number>(0);
  const lastCaptureTime = useRef<number>(0);
  const fpsInterval = 1000 / TARGET_FPS; // 1000ms = 1 second
  const captureInterval = 1000; // Capture frame every 1 second

  // Debug mode for testing beard detection
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
      { value: '1', label: 'Person with Beard' },
      { value: '2', label: 'Person without Beard' },
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
      //console.log('initializing detection');
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        // Ensure full viewport coverage on all devices
        mainCan.style.width = '100vw';
        mainCan.style.height = '100vh';
        mainCan.style.position = 'fixed';
        mainCan.style.top = '0';
        mainCan.style.left = '0';
        mainCan.style.zIndex = '1';
      }

      const initializeDetection = async () => {
        try {
          detectionService.current = new DetectionService();
          await detectionService.current.initialize();
          setIsModelLoading(false);
          // Start real-time detection for beard
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

  // Handle window resize and orientation change
  useEffect(() => {
    const handleResize = () => {
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        mainCan.style.width = '100vw';
        mainCan.style.height = '100vh';
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const startRealTimeDetection = (
    functionsToSetNumbers: Array<{ x: number; f: (x: number) => void }>
  ) => {
    // Set up camera for real-time detection
    // NOTE: Current beard detection uses face landmarks and image analysis
    // For production, consider using a specialized beard detection model like:
    // - MediaPipe Face Detection + custom beard classifier
    // - TensorFlow.js with a pre-trained beard detection model
    // - Face-api.js with facial hair detection capabilities
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Optimized frame processor - capture and process once per second
        const frameProcessor = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            const now = Date.now();

            // Only capture frame once per second
            if (now - lastCaptureTime.current >= captureInterval) {
              lastCaptureTime.current = now;

              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);

              const imageData = canvas.toDataURL('image/jpeg');

              // Replace frame in queue (only keep latest frame)
              frameQueue.current = [imageData];

              // Process frame immediately since we're already throttling capture
              if (!isProcessing.current) {
                processFrameQueue(functionsToSetNumbers);
              }
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

  // Process frame queue asynchronously - simplified since we throttle at capture
  const processFrameQueue = async (
    functionsToSetNumbers: Array<{ x: number; f: (x: number) => void }>
  ) => {
    if (isProcessing.current || frameQueue.current.length === 0) return;

    isProcessing.current = true;

    try {
      const imageData = frameQueue.current.shift();
      if (imageData) {
        await handleBeardDetection(imageData, functionsToSetNumbers);
      }
    } finally {
      isProcessing.current = false;
    }
  };

  const handleBeardDetection = async (
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
        const detection = await detectionService.current.detectBeard(imageData);
        newPersonValue = detection.personValue;

        // Log detection results for debugging
        console.log('Beard detection:', {
          personDetected: detection.personDetected,
          beardDetected: detection.beardDetected,
          personValue: newPersonValue,
        });
      }
      // Only update if value changed (performance optimization)
      if (personValue.current !== newPersonValue) {
        //console.log('previous value', personValue.current);
        personValue.current = newPersonValue;
        //console.log('sending value', newPersonValue);
        // Send value to Rive
        setPersonValue(newPersonValue, functionsToSetNumbers);
      }
    } catch (error) {
      //console.error('Beard detection failed:', error);
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
    <div className="h-screen w-screen fixed inset-0" id="MainCanvas">
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
