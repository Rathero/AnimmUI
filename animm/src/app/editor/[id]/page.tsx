'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRive, Fit, Layout } from '@rive-app/react-canvas';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorPlay } from '@/components/editor/editor-play';
import { EditorResolution } from '@/components/editor/editor-resolution';
import { EditorText } from '@/components/editor/editor-text';
import { EditorSelect } from '@/components/editor/editor-select';

import { templatesService } from '@/app/services/TemplatesService';
import { ApiTemplate, Module, TemplateVariable } from '@/types/collections';
import { ChevronDown, Crop, ImageMinus, ImageUpscale } from 'lucide-react';
import EditorImages from '@/components/editor/editor-images';

export default function Editor() {
  const params = useParams<{ id: string }>();

  const [templateData, setTemplateData] = useState<any>();
  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);

  const { rive, RiveComponent } = useRive({
    src: '/test/WL_Product.riv',
    artboard: 'Template',
    stateMachines: 'SM',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
  });

  const [playing, setPlaying] = useState(true);
  const playRive = () => {
    console.log('in');
    if (rive) {
      rive.play;
      playing ? rive.pause() : rive.play();
      setPlaying(!playing);
    }
  };

  const changeText = (text: string, variableToModify: TemplateVariable) => {
    if (rive) {
      //event.target.value === '' ? (event.target.value = ' ') : '';
      rive.setTextRunValue(variableToModify.path, text);
      variableToModify.defaultValue = text;
      setTemplate(template);
    }
  };
  async function initializeTemplate() {
    const template = await templatesService.get(params.id);
    setTemplate(template);
  }

  const changeresolution = (event: any) => {
    const mainCan: any = document.querySelector('#MainCanvas');
    if (mainCan) {
      const resolution = event.split('-');
      console.log(resolution);
      mainCan.style.width = resolution[0] + 'px';
      mainCan.style.height = resolution[1] + 'px';
    }
  };

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
                ...rest
              }) => (
                <>
                  <EditorResolution resolution={changeresolution} />
                  <EditorPlay playRive={playRive} playing={playing} />
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
                      className="h-[1920px] w-[1080px] resizeItem flex rounded-lg border bg-white shadow-md shadow-slate-500/10"
                    >
                      <div className="size-full">
                        <RiveComponent />
                      </div>
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>

        <aside className="w-64 px-4 ps-0 pt-0 transition-all">
          {template?.Result.modules.map((x: Module, index) => {
            return (
              <Collapsible defaultOpen className="group/collapsible space-y-2">
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
                        {x.variables.map((y: TemplateVariable) => {
                          return (
                            <>
                              {y.type === 1 && (
                                <EditorText
                                  variable={y}
                                  changeText={changeText}
                                />
                              )}
                              {y.type === 2 && (
                                <EditorSelect
                                  variable={y}
                                  changeInput={changeText}
                                />
                              )}
                            </>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <EditorImages images={x.images} />
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </aside>
      </div>
    </>
  );
}
