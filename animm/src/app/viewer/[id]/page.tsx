'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, Rive } from '@rive-app/react-canvas';
import html2canvas from 'html2canvas';
import RecordRTC from 'recordrtc';

import {
  ApiTemplate,
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';
import RiveComp from '@/components/editor/rive-component';
import useTemplatesService from '@/app/services/TemplatesService';
import { Button } from '@/components/ui/button';

// Add type declaration for captureStream
declare global {
  interface HTMLElement {
    captureStream(frameRate?: number): MediaStream;
  }
}

export default function Viewer() {
  const params = useParams<{ id: string }>();

  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);

  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<RecordRTC | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { get } = useTemplatesService();
  async function initializeTemplate() {
    const template = await get(params.id);
    setTemplate(template);
  }
  async function changeText(text: string, variableToModify: TemplateVariable) {
    if (rivesStates) {
      rivesStates.forEach(riveState => {
        if (riveState) {
          text = text === '' ? ' ' : text;
          if (variableToModify.paths.length > 0) {
            variableToModify.paths.map(path => {
              riveState!.setTextRunValueAtPath(
                variableToModify.value,
                text,
                path.path
              );
            });
          } else riveState.setTextRunValue(variableToModify.value, text);
        }
      });
      variableToModify.defaultValue = text;
      setTemplate(template);
    }
  }

  const startRecording = async () => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;
    
    setIsRecording(true);
    
    // Find the canvas element inside the container
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) {
      console.error('No canvas found');
      setIsRecording(false);
      return;
    }

    try {
      const stream = canvas.captureStream(30); // 30 FPS
      recorderRef.current = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        frameRate: 30,
      });

      recorderRef.current.startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    debugger;
    if (typeof window === 'undefined') return;
    if (!recorderRef.current) return;

    try {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `animation-${params.id}.webm`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        setIsRecording(false);
        recorderRef.current = null;
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    initializeTemplate();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (template && rivesStates && rivesStates.length > 0) {
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        mainCan.style.width = window.innerWidth + 'px';
        mainCan.style.height = window.innerHeight + 'px';
      }

      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        const variableToModify = template.Result.modules
          .flatMap(module => module.variables)
          .find(variable => variable.name === key);
        if (variableToModify) {
          if (variableToModify.type === TemplateVariableTypeEnum.TextArea) {
            changeText(value, variableToModify);
          }
        }
      });
    }
  }, [template, rivesStates]);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
        >
          {isRecording ? 'Stop Recording' : 'Export to Video'}
        </Button>
      </div>
      <div className="h-full w-full" id="MainCanvas" ref={containerRef}>
        {template &&
          template.Result.modules.length > 0 &&
          template.Result.modules[0].file && (
            <RiveComp
              src={template.Result.modules[0].file}
              setAssetsParent={setAssets}
              setRiveStatesParent={setRiveStates}
            />
          )}
      </div>
    </>
  );
}
