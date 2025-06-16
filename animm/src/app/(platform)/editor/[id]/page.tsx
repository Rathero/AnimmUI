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

  async function changeresolution(width: number, height: number) {
    const mainCan: any = document.querySelector('#MainCanvas');
    if (mainCan) {
      mainCan.style.width = width + 'px';
      mainCan.style.height = height + 'px';
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
    let paramsUrl = new URLSearchParams();
    if (template) {
      template.Result.modules.forEach(module => {
        module.variables.forEach(variable => {
          paramsUrl.append(variable.name, variable.defaultValue || '');
        });
      });
    }
    paramsUrl.append('autoplay', 'true');
    window.open('/viewer/' + params.id + '?' + paramsUrl.toString(), '_blank');
  };

  const [isExporting, setIsExporting] = useState(false);

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
        'https://animmapiv2.azurewebsites.net/Export',
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

  return (
    <>
      <div className="absolute flex top-0 bottom-0 right-0 left-0 overflow-hidden">
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
                  <EditorResolution
                    setResolutionFunction={changeresolution}
                    compositions={template?.Result.templateCompositions || []}
                  />
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

        <aside className="w-64 px-4 flex flex-col ps-0 pt-0 transition-all">
          <div className="flex-auto">
            {template?.Result.modules.map((x: Module, index) => {
              return (
                <div key={'div1' + index}>
                  <Collapsible
                    defaultOpen
                    className="group/collapsible space-y-2"
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="rounded-md border ps-4 pe-2 py-2 text-sm bg-sidebar flex flex-row items-center">
                        Module {index}
                        <ChevronDown className="ml-auto h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 py-2">
                      {x.variables.length > 0 && (
                        <div className="space-y-2">
                          <div className="ps-3 space-y-2">
                            {x.variables.map(
                              (y: TemplateVariable, index2: number) => {
                                return (
                                  <div key={'div2' + index2}>
                                    {y.type ===
                                      TemplateVariableTypeEnum.TextArea && (
                                      <EditorText
                                        variable={y}
                                        changeText={changeText}
                                      />
                                    )}
                                    {y.type ===
                                      TemplateVariableTypeEnum.Selector && (
                                      <EditorSelect
                                        variable={y}
                                        changeInput={changeSelect}
                                      />
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                      <EditorImages
                        images={x.images}
                        changeImageParent={changeImage}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              );
            })}
          </div>
          {template?.Result && (
            <EditorCsv template={template.Result}></EditorCsv>
          )}
          <EditorUrl generateUrlFunction={generateUrlFunction} />
          <Button className="w-full" onClick={() => generateUrl()}>
            <LinkIcon />
            Preview
          </Button>
          <Button
            className="w-full mt-2"
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
        </aside>
      </div>
    </>
  );
}
