'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRive, Fit, Layout } from '@rive-app/react-canvas';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
import 'react-image-crop/src/ReactCrop.scss';
import ReactCrop, {
  type Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorPlay } from '@/components/editor/editor-play';
import { EditorResolution } from '@/components/editor/editor-resolution';

import templatesJson from '@/data/Template.json';
import { templatesService } from '@/app/services/TemplatesService';
import { ApiTemplate, Module, TemplateVariable } from '@/types/collections';

export default function Editor() {
  const [templateData, setTemplateData] = useState<any>(
    templatesJson.filter(template => template.id === 0)[0]
  );
  const [template, setTemplate] = useState<ApiTemplate | undefined>(undefined);
  const [imgSrc, setImgSrc] = useState<string>('/img/Avatar.webp');
  const [originalSrc, setOriginalSrc] = useState<string>('/img/Avatar.webp');

  const [crop, setCrop] = useState<Crop | undefined>({
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
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

  const changeText = (event: any) => {
    if (rive) {
      templateData.text
        .filter((texts: { v: any }) => texts.v === event.target.id)
        .map((text: any) => {
          event.target.value === '' ? (event.target.value = ' ') : '';
          if (text.path.length > 0) {
            text.path.map((path: any) => {
              rive.setTextRunValueAtPath(text.v, event.target.value, path);
            });
          } else {
            rive.setTextRunValue(text.v, event.target.value);
          }
          text.default = event.target.value;
        });
      setTemplateData(templateData);
    }
  };
  async function initializeTemplate() {
    const template = await templatesService.get('1');
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

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setOriginalSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }
  const imgRef = useRef<HTMLImageElement>(null);

  async function canvasPreview() {
    const image = imgRef.current;
    if (!image || !crop) {
      throw new Error('Crop canvas does not exist');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      crop.width * scaleX,
      crop.height * scaleY
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const pixelRatio = window.devicePixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    setImgSrc(URL.createObjectURL(blob));
  }

  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }
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
            {template?.Result.modules.map((x: Module) =>
              x.variables.map((y: TemplateVariable) => {
                return (
                  <div className="grid w-full gap-1.5" key={y.path}>
                    <label
                      className="text-sm text-sidebar-foreground"
                      htmlFor={y.path}
                    >
                      {y.name}
                    </label>
                    <Textarea
                      id={y.path}
                      defaultValue={y.defaultValue}
                      onChange={changeText}
                    />
                  </div>
                );
              })
            )}
            <Popover>
              <PopoverTrigger asChild>
                <div className="grid grid-cols-2 gap-1.5">
                  <Image
                    width={100}
                    height={100}
                    alt=""
                    className="cursor-pointer rounded-md border transition-opacity hover:opacity-75"
                    src={imgSrc}
                  ></Image>
                </div>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-60">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="relative size-fit">
                      <Image
                        width={300}
                        height={100}
                        alt=""
                        className="cursor-pointer rounded-lg border transition-opacity hover:opacity-75 relative"
                        src={originalSrc}
                        onLoad={onImageLoad}
                      ></Image>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                      />
                      <ReactCrop
                        crop={crop}
                        onChange={c => {
                          console.log(c);
                          setCrop(c);
                        }}
                      >
                        <Image
                          ref={imgRef}
                          width={300}
                          height={100}
                          alt=""
                          className="cursor-pointer rounded-lg border transition-opacity hover:opacity-75 relative"
                          src={originalSrc}
                        ></Image>
                      </ReactCrop>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Button
                      className="text-xs p-3 h-8 rounded-lg"
                      onClick={() => {
                        canvasPreview();
                      }}
                    >
                      Crop
                    </Button>
                    <Button className="text-xs p-3 h-8 rounded-lg">
                      Remove Background
                    </Button>
                    <Button className="text-xs p-3 h-8 rounded-lg">
                      Expand Image
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </aside>
      </div>
    </>
  );
}
