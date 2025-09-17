'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Rive } from '@rive-app/react-webgl2';
import { DetectionService } from './services/DetectionService';
import RiveComp from '@/components/editor/rive-component';
import { VariableStringSetter } from '@/components/editor/variable-string-setter';
import {
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';

export default function FittingRoomPage() {
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);
  const [functionsToSetNumbers, setFunctionsToSetNumbers] = useState<
    Array<{ x: number; f: (x: number) => void }>
  >([]);
  const detectionService = useRef<DetectionService | null>(null);
  const lastDetectionTime = useRef<number>(0);
  const detectionThrottle = 100;
  const personValue = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);
  const frameQueue = useRef<string[]>([]);
  const lastCaptureTime = useRef<number>(0);
  const captureInterval = 1000;

  const [initialized, setInitialized] = useState(false);

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
      setInitialized(true);
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
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
          startRealTimeDetection(functionsToSetNumbers);
        } catch (error) {}
      };

      initializeDetection();
    }
  }, [rivesStates, functionsToSetNumbers]);

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
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const frameProcessor = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            const now = Date.now();

            if (now - lastCaptureTime.current >= captureInterval) {
              lastCaptureTime.current = now;

              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);

              const imageData = canvas.toDataURL('image/jpeg');

              frameQueue.current = [imageData];

              if (!isProcessing.current) {
                processFrameQueue(functionsToSetNumbers);
              }
            }
          }
          requestAnimationFrame(frameProcessor);
        };

        video.addEventListener('loadeddata', frameProcessor);
      })
      .catch(error => {});
  };

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

    const now = Date.now();
    if (now - lastDetectionTime.current < detectionThrottle) {
      return;
    }
    lastDetectionTime.current = now;

    try {
      const detection = await detectionService.current.detectBeard(imageData);
      const newPersonValue = detection.personValue;

      if (personValue.current !== newPersonValue) {
        personValue.current = newPersonValue;
        setPersonValue(newPersonValue, functionsToSetNumbers);
      }
    } catch (error) {}
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
      <RiveComp
        src="https://animmfilesv2.blob.core.windows.net/riv/demo/nedap_fitting_room.riv"
        setAssetsParent={() => {}}
        setRiveStatesParent={setRiveStates}
        autoplay={true}
        artboard="Template"
      />

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
