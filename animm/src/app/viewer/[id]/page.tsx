'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, Rive } from '@rive-app/react-webgl2';

import {
  ApiTemplate,
  TemplateVariable,
  TemplateVariableTypeEnum,
} from '@/types/collections';
import RiveComp from '@/components/editor/rive-component';
import useTemplatesService from '@/app/services/TemplatesService';
import Script from 'next/script';
import { VariableStringSetter } from '@/components/editor/variable-string-setter';
import {
  mediaRecorder,
  RecordingConfig,
  RecordingResult,
  RecordingStatus,
} from '@/lib/media-recorder';

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
  const [functionsToSetBoolean, setFunctionsToSetBoolean] = useState<
    Array<{ x: number; f: (x: boolean) => void }>
  >([]);
  async function changeCheckbox(
    value: boolean,
    variableToModify: TemplateVariable
  ) {
    functionsToSetBoolean.forEach(x => {
      if (x.x == variableToModify.id) {
        x.f(value);
      }
    });
  }
  const [functionsToSetStrings, setFunctionsToSetStrings] = useState<
    Array<{ x: number; f: (x: string) => void }>
  >([]);
  async function changeText(text: string, variableToModify: TemplateVariable) {
    functionsToSetStrings.forEach(x => {
      if (x.x == variableToModify.id) {
        x.f(text);
      }
    });
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
          .find(variable => variable.id === Number.parseInt(key));
        if (variableToModify) {
          if (variableToModify.type === TemplateVariableTypeEnum.TextArea) {
            value = value.replaceAll(
              '\\n',
              `
              `
            );
            changeText(value, variableToModify);
          } else if (
            variableToModify.type === TemplateVariableTypeEnum.Selector
          ) {
            changeSelect(Number.parseInt(value), variableToModify);
          } else if (
            variableToModify.type === TemplateVariableTypeEnum.Boolean
          ) {
            changeCheckbox(value.toLowerCase() == 'true', variableToModify);
          }
        }
      });
    }
  }, [template, rivesStates]);

  const [functionsToSetNumbers, setFunctionsToSetNumbers] = useState<
    Array<{ x: number; f: (x: number) => void }>
  >([]);
  async function changeSelect(
    value: number,
    variableToModify: TemplateVariable
  ) {
    functionsToSetNumbers.forEach(x => {
      if (x.x == variableToModify.id) {
        x.f(value);
      }
    });
  }
  const queryString =
    typeof window !== 'undefined' ? window.location.search : '';
  const urlParams = new URLSearchParams(queryString);
  const shouldAutoplay = urlParams.get('autoplay') === 'true';
  const isPdf = urlParams.get('pdf') === 'true';
  const artBoard = urlParams.get('artboard');
  // Bleed size: 3mm = ~12px at 96dpi
  const bleedPx = isPdf ? 12 : 0;

  // Expose global function for .NET to call
  useEffect(() => {
    // Store the recording result globally for .NET to poll
    (window as any).__RECORDING_RESULT__ = null;
    (window as any).__RECORDING_IN_PROGRESS__ = false;
    (window as any).__RECORDING_STATUS__ = null;

    // Make the recording function available globally for .NET
    (window as any).startRecording = async (config: RecordingConfig) => {
      try {
        console.log('Starting recording from .NET:', config);

        // Set recording in progress
        (window as any).__RECORDING_IN_PROGRESS__ = true;
        (window as any).__RECORDING_RESULT__ = null;
        (window as any).__RECORDING_STATUS__ = null;

        // Ensure Rive animation is ready and stopped before recording
        const riveInstance = (window as any).__RIVE_INSTANCE__;
        if (riveInstance && typeof riveInstance.stop === 'function') {
          try {
            riveInstance.stop();
            console.log('Rive animation stopped before recording');
          } catch (error) {
            console.warn(
              'Could not stop Rive animation before recording:',
              error
            );
          }
        }

        // Status update callback
        const onStatusUpdate = (status: RecordingStatus) => {
          (window as any).__RECORDING_STATUS__ = status;
        };

        const result = await mediaRecorder.startRecording(
          config,
          onStatusUpdate
        );

        // Store the result globally for .NET to poll
        (window as any).__RECORDING_RESULT__ = result;
        (window as any).__RECORDING_IN_PROGRESS__ = false;

        return result;
      } catch (error) {
        console.error('Error in recording:', error);
        const errorResult: RecordingResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          format: config.format,
          size: 0,
          duration: 0,
        };

        // Store the error result
        (window as any).__RECORDING_RESULT__ = errorResult;
        (window as any).__RECORDING_IN_PROGRESS__ = false;

        return errorResult;
      }
    };

    // Function to check if recording is in progress
    (window as any).isRecording = () => {
      return (
        mediaRecorder.isCurrentlyRecording() ||
        (window as any).__RECORDING_IN_PROGRESS__
      );
    };

    // Function to get the recording result (for .NET to poll)
    (window as any).getRecordingResult = () => {
      return (window as any).__RECORDING_RESULT__;
    };

    // Function to get the current recording status
    (window as any).getRecordingStatus = () => {
      return (
        (window as any).__RECORDING_STATUS__ || mediaRecorder.getCurrentStatus()
      );
    };

    // Function to stop recording manually
    (window as any).stopRecording = () => {
      mediaRecorder.stopRecording();
    };

    // Function to clear the recording result
    (window as any).clearRecordingResult = () => {
      (window as any).__RECORDING_RESULT__ = null;
      (window as any).__RECORDING_IN_PROGRESS__ = false;
      (window as any).__RECORDING_STATUS__ = null;
    };

    // Function to manually start Rive animation (for testing)
    (window as any).startRiveAnimation = () => {
      const riveInstance = (window as any).__RIVE_INSTANCE__;
      if (riveInstance && typeof riveInstance.play === 'function') {
        try {
          riveInstance.play('SM');
          console.log('Rive animation started manually');
        } catch (error) {
          console.warn('Could not start Rive animation manually:', error);
        }
      } else {
        console.warn('Rive instance not available');
      }
    };

    // Function to manually stop Rive animation (for testing)
    (window as any).stopRiveAnimation = () => {
      const riveInstance = (window as any).__RIVE_INSTANCE__;
      if (riveInstance && typeof riveInstance.stop === 'function') {
        try {
          riveInstance.stop();
          console.log('Rive animation stopped manually');
        } catch (error) {
          console.warn('Could not stop Rive animation manually:', error);
        }
      } else {
        console.warn('Rive instance not available');
      }
    };

    // Legacy GIF functions for backward compatibility
    (window as any).startGifRecording = async (config: any) => {
      const recordingConfig: RecordingConfig = {
        ...config,
        format: 'gif',
      };
      return (window as any).startRecording(recordingConfig);
    };

    (window as any).isGifRecording = () => {
      return (window as any).isRecording();
    };

    (window as any).getGifRecordingResult = () => {
      return (window as any).getRecordingResult();
    };

    (window as any).clearGifRecordingResult = () => {
      return (window as any).clearRecordingResult();
    };

    // Cleanup function
    return () => {
      delete (window as any).startRecording;
      delete (window as any).isRecording;
      delete (window as any).getRecordingResult;
      delete (window as any).getRecordingStatus;
      delete (window as any).stopRecording;
      delete (window as any).clearRecordingResult;
      delete (window as any).startRiveAnimation;
      delete (window as any).stopRiveAnimation;
      delete (window as any).startGifRecording;
      delete (window as any).isGifRecording;
      delete (window as any).getGifRecordingResult;
      delete (window as any).clearGifRecordingResult;
      delete (window as any).__RECORDING_RESULT__;
      delete (window as any).__RECORDING_IN_PROGRESS__;
      delete (window as any).__RECORDING_STATUS__;
    };
  }, []);

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
          {/* Full Print Guide SVG - positioned at absolute 0,0 */}
          <img
            src="/mm/Print Guide Full.svg"
            alt="Print Guide Full"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              width: '100%',
              height: '100%',
            }}
          />

          {/* Rive animation with margins to overlap the SVG */}
          <div
            id="MainCanvas"
            style={{
              position: 'relative',
              zIndex: 2,
              marginTop: '20px',
              marginLeft: '20px',
            }}
          >
            {template &&
              template.Result.modules.length > 0 &&
              template.Result.modules[0].file && (
                <RiveComp
                  src={template.Result.modules[0].file}
                  setAssetsParent={setAssets}
                  setRiveStatesParent={setRiveStates}
                  autoplay={shouldAutoplay} // Don't autoplay if recording is expected
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
                autoplay={shouldAutoplay} // Don't autoplay if recording is expected
                artboard={artBoard || ''}
              />
            )}
          {template?.Result &&
            template?.Result.modules.map(module =>
              module.variables.map(variable => (
                <VariableStringSetter
                  variable={variable}
                  rive={rivesStates[0]}
                  onSetFunctionString={setValueFunction => {
                    setFunctionsToSetStrings(prev => [
                      { x: variable.id, f: setValueFunction },
                      ...prev,
                    ]);
                  }}
                  onSetFunctionBoolean={setValueFunction => {
                    setFunctionsToSetBoolean(prev => [
                      { x: variable.id, f: setValueFunction },
                      ...prev,
                    ]);
                  }}
                  onSetFunctionNumber={setValueFunction => {
                    setFunctionsToSetNumbers(prev => [
                      { x: variable.id, f: setValueFunction },
                      ...prev,
                    ]);
                  }}
                />
              ))
            )}
        </div>
      )}
    </>
  );
}
