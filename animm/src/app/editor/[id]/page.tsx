'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRive, Fit, Layout } from '@rive-app/react-canvas';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  useTransformComponent,
  useTransformEffect,
} from 'react-zoom-pan-pinch';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorPlay } from '@/components/editor/editor-play';
import { EditorResolution } from '@/components/editor/editor-resolution';
import { EditorText } from '@/components/editor/editor-text';

import { templatesService } from '@/app/services/TemplatesService';
import {
  ApiTemplate,
  Module,
  TemplateImage,
  TemplateVariable,
} from '@/types/collections';
import { Crop, ImageMinus, ImageUpscale } from 'lucide-react';

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

  const changeText = (event: any, moduleId: number, moduleType: number) => {
    if (moduleType === 0) {
      if (rive) {
        template?.Result.modules[moduleId].variables
          .filter(
            (variables: { path: any }) => variables.path === event.target.id
          )
          .map((variable: any) => {
            event.target.value === '' ? (event.target.value = ' ') : '';
            // if (variable.path.length > 0) {
            //   variable.path.map((path: any) => {
            //     rive.setTextRunValueAtPath(
            //       variable.path,
            //       event.target.value,
            //       path
            //     );
            //   });
            // } else {
            //   rive.setTextRunValue(variable.path, event.target.value);
            // }
            rive.setTextRunValue(variable.path, event.target.value);
            variable.defaultValue = event.target.value;
          });
        setTemplate(template);
      }
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

        <aside className="w-60 px-4 ps-0 pt-0 transition-all">
          <div className="grid w-full gap-2.5">
            {template?.Result.modules.map((x: Module, index) => {
              return (
                <div key={x.file}>
                  <h3>Module {index}</h3>

                  {x.variables.length > 0 && (
                    <div>
                      <h3>Variables</h3>
                      {x.variables.map((y: TemplateVariable) => {
                        return (
                          <EditorText
                            variable={y}
                            moduleId={index}
                            moduleType={x.moduleType}
                            changeText={changeText}
                          />
                        );
                      })}
                    </div>
                  )}

                  {x.images.length > 0 && (
                    <div>
                      <h3>Images</h3>

                      {x.images.map((y: TemplateImage, index) => {
                        return (
                          <Popover key={index}>
                            <PopoverTrigger asChild>
                              <div className="grid grid-cols-2 gap-1.5">
                                <Image
                                  width={100}
                                  height={100}
                                  alt=""
                                  className="cursor-pointer rounded-md border transition-opacity hover:opacity-75"
                                  loader={() => y.image}
                                  src={y.image}
                                ></Image>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent
                              side="left"
                              align="start"
                              className="w-48 p-2"
                            >
                              <div className="grid gap-1.5">
                                <div className="relative size-fit">
                                  {/* add upload image functionality here */}
                                  <div className="absolute size-full grid items-center justify-center bg-background/25 transition-opacity opacity-0 hover:opacity-100 z-50 cursor-pointer">
                                    <Button className="text-xs p-3 h-8 rounded-lg">
                                      Upload Image
                                    </Button>
                                  </div>
                                  <Image
                                    width={200}
                                    height={200}
                                    alt=""
                                    className="cursor-pointer rounded-lg border transition-opacity hover:opacity-75 relative blur-0 hover:blur-2xl"
                                    loader={() => y.image}
                                    src={y.image}
                                  ></Image>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="sm">
                                          <Crop />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Crop Image</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="sm">
                                          <ImageMinus />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>AI Remove Background</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="sm">
                                          <ImageUpscale />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>AI Extend Image</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </>
  );
}
