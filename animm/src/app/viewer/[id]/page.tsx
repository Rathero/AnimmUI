'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, Rive } from '@rive-app/react-canvas';

import {
  ApiTemplate,
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';
import RiveComp from '@/components/editor/rive-component';
import useTemplatesService from '@/app/services/TemplatesService';
import Script from 'next/script';

export default function Viewer() {
  const params = useParams<{ id: string }>();

  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);

  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);

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

  useEffect(() => {
    initializeTemplate();
  }, []);

  useEffect(() => {
    if (template && rivesStates && rivesStates.length > 0) {
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        mainCan.style.width = window.innerWidth + 'px';
        mainCan.style.height = window.innerHeight + 'px';
      }

      const queryString =
        typeof window !== 'undefined' ? window.location.search : '';
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

  const queryString =
    typeof window !== 'undefined' ? window.location.search : '';
  const urlParams = new URLSearchParams(queryString);
  const shouldAutoplay = urlParams.get('autoplay') === 'true';
  const shouldRecord = urlParams.get('record') === 'true';
  const isPdf = urlParams.get('pdf') === 'true';
  const artBoard = urlParams.get('artboard');
  // Bleed size: 3mm = ~12px at 96dpi
  const bleedPx = isPdf ? 12 : 0;

  return (
    <>
      {isPdf ? (
        <div
          className="relative flex items-center justify-center"
          style={{
            background: '#fff',
            padding: bleedPx,
            boxSizing: 'content-box',
            minHeight: '100vh',
            minWidth: '100vw',
          }}
        >
          <img
            src="/pdf/Print Guide_Top Left.svg"
            alt="Print Guide Top Left"
            style={{
              position: 'absolute',
              top: bleedPx,
              left: bleedPx,
              zIndex: 10,
            }}
          />
          <img
            src="/pdf/Print Guide_Top Right.svg"
            alt="Print Guide Top Left"
            style={{
              position: 'absolute',
              top: bleedPx,
              right: bleedPx,
              zIndex: 10,
            }}
          />
          <img
            src="/pdf/Print Guide_Bottom Right.svg"
            alt="Print Guide Top Left"
            style={{
              position: 'absolute',
              bottom: bleedPx,
              right: bleedPx,
              zIndex: 10,
            }}
          />
          <img
            src="/pdf/Print Guide_Bottom Left.svg"
            alt="Print Guide Top Left"
            style={{
              position: 'absolute',
              bottom: bleedPx,
              left: bleedPx,
              zIndex: 10,
            }}
          />
          <div id="MainCanvas" style={{ position: 'relative', zIndex: 1 }}>
            {template &&
              template.Result.modules.length > 0 &&
              template.Result.modules[0].file && (
                <RiveComp
                  src={template.Result.modules[0].file}
                  setAssetsParent={setAssets}
                  setRiveStatesParent={setRiveStates}
                  autoplay={shouldAutoplay}
                />
              )}
          </div>
        </div>
      ) : (
        <div className="h-full w-full" id="MainCanvas">
          {template &&
            template.Result.modules.length > 0 &&
            template.Result.modules[0].file && (
              <RiveComp
                src={template.Result.modules[0].file}
                setAssetsParent={setAssets}
                setRiveStatesParent={setRiveStates}
                autoplay={shouldAutoplay}
                artboard={artBoard || ''}
              />
            )}
        </div>
      )}

      {shouldRecord && (
        <Script
          id="metapixel-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `setTimeout(() => {
                const canvas = document.querySelector('#MainCanvas canvas');
                if (!canvas) {
                    throw new Error('Canvas element not found');
                }

                const stream = canvas.captureStream(60); // 60 FPS
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: 40000000,
                });

                const chunks = [];
                mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'video/webm;codecs=vp9' });
                    const formData = new FormData();
                    formData.append('video', blob, 'video.webm');

                    try {
                        const response = await fetch('https://animmapiv2.azurewebsites.net/export/save', {
                            method: 'POST',
                            body: formData,
                        });
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('Failed to save video:', errorText);
                          throw new Error('Failed to save video: ' + errorText);
                        }
                        console.log('Video saved successfully.');
                    } catch (error) {
                        console.error('Error saving video:', error);
                    }
                };

                // Simulating the Rive instance play call
                // Replace with your actual animation trigger if needed
                const riveInstance = window.__RIVE_INSTANCE__;
                if (riveInstance) {
                    riveInstance.play('SM');
                }

                console.log('Starting recording...');
                mediaRecorder.start();

                setTimeout(() => {
                    mediaRecorder.stop();
                    console.log('Stopping recording...');
                }, 6000); // Record for 10 seconds
            }, 4000); // Delay to ensure the canvas is ready`,
          }}
        />
      )}
    </>
  );
}
