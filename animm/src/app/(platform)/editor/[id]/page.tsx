'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileAsset, decodeImage, Rive } from '@rive-app/react-canvas';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorPlay } from '@/components/editor/editor-play';
import { EditorText } from '@/components/editor/editor-text';
import { EditorSelect } from '@/components/editor/editor-select';

import {
  ApiTemplate,
  Module,
  TemplateVariable,
  TemplateVariableTypeEnum,
  TemplateComposition,
} from '@/types/collections';
import { ChevronDown, LinkIcon, Loader2 } from 'lucide-react';
import EditorImages from '@/components/editor/editor-images';
import RiveComp from '@/components/editor/rive-component';
import EditorUrl from '@/components/editor/editor-url';
import {
  GeneratedAnimation,
  GeneratedAnimationStatusEnum,
  GeneratedModule,
} from '@/types/generatedAnimations';
import useTemplatesService from '@/app/services/TemplatesService';
import useGeneratedAnimationService from '@/app/services/GeneratedAnimationsService';
import EditorResolution from '@/components/editor/editor-resolution';
import EditorCsv from '@/components/editor/editor-csv';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Editor() {
  const params = useParams<{ id: string }>();

  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);
  const [generatedAnimation, setGeneratedAnimation] = useState<
    GeneratedAnimation | undefined
  >(undefined);

  const [artBoard, setArtBoard] = useState<string>('Template');
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const [rivesStates, setRiveStates] = useState<Rive[]>([]);
  const changeImage = async (url: string, i: number) => {
    let stringImage = '';
    if (assets.length > 0) {
      fetch(url).then(async res => {
        const array = new Uint8Array(await res.arrayBuffer());
        stringImage = new TextDecoder().decode(array);
        if (generatedAnimation) {
          generatedAnimation.modules.forEach(x => {
            if (x.images[i]) x.images[i].image = stringImage;
          });
          setGeneratedAnimation(generatedAnimation);
        }
        const image = await decodeImage(array);
        (assets[i] as any).setRenderImage(image);
      });
    }
  };
  const [playing, setPlaying] = useState(true);
  async function playRive() {
    if (rivesStates) {
      rivesStates.forEach(riveState => {
        if (riveState) {
          riveState.play;
          playing ? riveState.pause() : riveState.play();
        }
      });
      setPlaying(!playing);
    }
  }

  async function changeSelect(
    value: string,
    variableToModify: TemplateVariable
  ) {
    rivesStates.forEach(riveState => {
      riveState.stateMachineInputs('SM')[0].value = isNaN(Number(value))
        ? value === 'true'
        : Number(value);
    });
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
    if (generatedAnimation) {
      generatedAnimation.modules.forEach(x => {
        x.variables.forEach(y => {
          if (y.templateVariable.id == variableToModify.id) {
            y.value = text;
          }
        });
      });
      setGeneratedAnimation(generatedAnimation);
    }
  }

  const { get } = useTemplatesService();
  async function initializeTemplate() {
    const template = await get(params.id);
    setTemplate(template);
    if (template) {
      if (
        template?.Result.templateCompositions &&
        template.Result.templateCompositions.length > 0
      ) {
        setArtBoard(template?.Result.templateCompositions[0].name);
        setCurrentHeight(
          template?.Result.templateCompositions[0].templateResolutions[0].height
        );
        setCurrentWidth(
          template?.Result.templateCompositions[0].templateResolutions[0].width
        );
      }
      const newGeneratedAnimation: GeneratedAnimation = {
        baseTemplate: template.Result,
        baseTemplateId: template.Result.id,
        image: template.Result.thumbnail,
        name: '',
        folder: '',
        status: GeneratedAnimationStatusEnum.NoStatus,
        modules: [],
        id: 0,
      };
      template.Result.modules.forEach(module => {
        const newModuleToAdd: GeneratedModule = {
          baseModule: module,
          baseModuleId: module.id,
          file: module.file,
          images: [],
          variables: [],
          moduleType: module.moduleType,
        };
        module.images.forEach(image => {
          newModuleToAdd.images.push({
            image: '',
            templateImage: image,
            tepmlateImageId: image.id,
          });
        });
        module.variables.forEach(variable => {
          newModuleToAdd.variables.push({
            value: '',
            templateVariable: variable,
            tepmlateVariableId: variable.id,
          });
        });
        newGeneratedAnimation.modules.push(newModuleToAdd);
      });
      setGeneratedAnimation(newGeneratedAnimation);
    }
  }

  const [currentWidth, setCurrentWidth] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  async function changeresolution(
    width: number,
    height: number,
    artBoard: string
  ) {
    setArtBoard(artBoard);
    rivesStates[0].reset({
      artboard: artBoard,
    });
    const mainCan: any = document.querySelector('#MainCanvas');
    if (mainCan) {
      mainCan.style.width = width + 'px';
      setCurrentWidth(width);
      mainCan.style.height = height + 'px';
      setCurrentHeight(height);
    }
  }

  const { add } = useGeneratedAnimationService();
  async function generateUrlFunction(name: string) {
    if (generatedAnimation) {
      generatedAnimation.name = name;
      add(generatedAnimation);
    }
  }

  // EventListener to Deactivate Zoom Pan to be able to Resize
  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
    const mainCanvas = document.getElementById('MainCanvas');
    if (!mainCanvas) return;

    const handleMouseEvent = (event: any) => {
      if (event.target.classList.contains('resizeItem')) {
        setIsResizing(true);
      } else {
        setIsResizing(false);
      }
    };

    document.body.addEventListener('mousemove', handleMouseEvent);
    mainCanvas.addEventListener('mousedown', handleMouseEvent);

    initializeTemplate();
    mainCanvas.removeEventListener('mousedown', handleMouseEvent);
    mainCanvas.removeEventListener('mousemove', handleMouseEvent);
  }, []);

  const generateUrl = async () => {
    if (template) {
      const paramsUrl = new URLSearchParams();
      template.Result.modules.forEach(module => {
        module.variables.forEach(variable => {
          paramsUrl.append(variable.name, variable.defaultValue || '');
        });
      });
      if (!template.Result.static) paramsUrl.append('autoplay', 'true');
      paramsUrl.append('artboard', artBoard);
      window.open(
        '/viewer/' + params.id + '?' + paramsUrl.toString(),
        '_blank'
      );
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Get all variables
      const variables: Record<string, string> = {};
      if (template) {
        template.Result.modules.forEach(module => {
          module.variables.forEach(variable => {
            variables[variable.name] = variable.defaultValue || '';
          });
        });
      }

      // Call export API
      const response = await fetch(
        'https://animmexport.azurewebsites.net/Export',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: params.id,
            variables,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Video exported successfully!');
        // Open the video in a new tab
        window.open(data.videoUrl, '_blank');
      } else {
        toast.error('Failed to export video');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export video');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpeg = async () => {
    setIsExportingJpeg(true);
    try {
      if (rivesStates && rivesStates.length > 0) {
        rivesStates.forEach(riveState => {
          if (riveState) {
            riveState.pause();
          }
        });
        setPlaying(false);
      }

      const canvas = document.querySelector(
        '#MainCanvas canvas'
      ) as HTMLCanvasElement;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${template?.Result.name || 'export'}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('JPEG exported successfully!');
      } else {
        toast.error('Failed to find canvas element for export.');
      }
    } catch (error) {
      console.error('JPEG export error:', error);
      toast.error('Failed to export JPEG.');
    } finally {
      setIsExportingJpeg(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#f7f8fa]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-base">Campaña:</span>{' '}
            {template?.Result.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {template?.Result && (
            <EditorCsv template={template.Result}></EditorCsv>
          )}
          <EditorUrl generateUrlFunction={generateUrlFunction} />
          <Button className="w-full" onClick={() => generateUrl()}>
            <LinkIcon />
            Preview
          </Button>
          {!template?.Result.static && (
            <Button
              className="w-full"
              onClick={handleExport}
              variant="default"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Export Video'
              )}
            </Button>
          )}
          {template?.Result.static && (
            <Button
              className="w-full"
              onClick={handleExportJpeg}
              variant="default"
              disabled={isExportingJpeg}
            >
              {isExportingJpeg ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Export JPEG'
              )}
            </Button>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar: Variables */}
        <div className="w-[320px] bg-white border-r flex flex-col p-4 overflow-y-auto min-h-0 max-h-full">
          {template?.Result.modules.map((mod: Module, idx: number) => (
            <Collapsible key={mod.id} defaultOpen className="mb-4">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-2 text-sm font-medium py-2 px-2 rounded hover:bg-muted transition-colors border">
                  <span>Section {String(idx + 1).padStart(2, '0')}</span>
                  <ChevronDown className="ml-auto h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                {mod.variables.map((v: TemplateVariable, vIdx: number) => (
                  <div key={v.id} className="space-y-1">
                    {v.type === TemplateVariableTypeEnum.TextArea && (
                      <EditorText variable={v} changeText={changeText} />
                    )}
                    {v.type === TemplateVariableTypeEnum.Selector && (
                      <EditorSelect variable={v} changeInput={changeSelect} />
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        {/* Center: Preview/Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          <div className="w-full flex justify-center items-center py-2 text-xs text-muted-foreground">
            {template?.Result.templateCompositions &&
              template.Result.templateCompositions.length > 0 && (
                <span>
                  {artBoard} {currentWidth}x{currentHeight}
                </span>
              )}
          </div>
          <div className="w-full h-full overflow-hidden p-4 pt-0">
            <div className="w-full h-full relative rounded-lg border bg-sidebar bg-editor">
              <TransformWrapper
                disabled={isResizing}
                disablePadding={true}
                centerOnInit={true}
                initialScale={1}
                wheel={{ step: 0.1 }}
                minScale={0.1}
                maxScale={3}
              >
                {({
                  zoomIn,
                  zoomOut,
                  setTransform,
                  resetTransform,
                  centerView,
                  zoomToElement,
                }) => (
                  <>
                    {!template?.Result.static && (
                      <EditorPlay playRive={playRive} playing={playing} />
                    )}
                    <EditorZoom
                      zoomIn={zoomIn}
                      zoomOut={zoomOut}
                      setTransform={setTransform}
                      resetTransform={resetTransform}
                      centerView={centerView}
                      zoomToElement={zoomToElement}
                    />
                    <TransformComponent wrapperClass="!w-full !h-full">
                      <div
                        id="MainCanvas"
                        className="h-[1920px] w-[1080px] flex rounded-lg border bg-white shadow-md shadow-slate-500/10"
                      >
                        <div className="size-full">
                          {template &&
                            template.Result.modules.length > 0 &&
                            template.Result.modules[0].file && (
                              <RiveComp
                                src={template.Result.modules[0].file}
                                setAssetsParent={setAssets}
                                setRiveStatesParent={setRiveStates}
                                artboard={artBoard}
                              />
                            )}
                        </div>
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        </div>
        {/* Right Sidebar: Compositions/Resolutions */}
        <div className="w-[320px] bg-white border-l flex flex-col p-4 overflow-y-auto min-h-0 max-h-full">
          <div className="text-sm font-semibold mb-2">Formats</div>
          {template?.Result.templateCompositions &&
            template.Result.templateCompositions.length > 0 && (
              <AccordionCompositions
                compositions={template.Result.templateCompositions}
                setResolutionFunction={changeresolution}
              />
            )}
        </div>
      </div>
    </div>
  );
}

function AccordionCompositions({
  compositions,
  setResolutionFunction,
}: {
  compositions: TemplateComposition[];
  setResolutionFunction: (
    width: number,
    height: number,
    artBoard: string
  ) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {compositions.map((composition, idx) => (
        <div key={composition.id}>
          <button
            className={`w-full flex items-center justify-between rounded border px-3 py-2 text-sm bg-sidebar hover:bg-muted transition-colors ${
              openIndex === idx ? 'font-semibold' : ''
            }`}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            type="button"
          >
            <span>{composition.name}</span>
            <span
              className={`transition-transform ${
                openIndex === idx ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
          </button>
          {openIndex === idx && (
            <div className="pl-4 py-2 space-y-1">
              {composition.templateResolutions.map(resolution => (
                <div
                  key={resolution.id}
                  className="cursor-pointer rounded px-2 py-1 hover:bg-accent text-xs flex justify-between items-center"
                  onClick={() =>
                    setResolutionFunction(
                      resolution.width,
                      resolution.height,
                      composition.name
                    )
                  }
                >
                  <span>{resolution.name}</span>
                  <span>
                    {resolution.width}x{resolution.height}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
