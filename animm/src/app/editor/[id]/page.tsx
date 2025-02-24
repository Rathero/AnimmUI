"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRive, Fit, Layout } from "@rive-app/react-canvas";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  useTransformComponent,
  useTransformEffect,
} from "react-zoom-pan-pinch";

import { EditorZoom } from "@/components/editor/editor-zoom";
import { EditorPlay } from "@/components/editor/editor-play";
import { EditorResolution } from "@/components/editor/editor-resolution";

import templatesJson from "@/data/Template.json";

export default function Editor() {
  const [templateData, setTemplateData] = useState<any>(
    templatesJson.filter((template) => template.id === 0)[0]
  );

  const { rive, RiveComponent } = useRive({
    src: "/test/WL_Product.riv",
    artboard: "Template",
    stateMachines: "SM",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
  });

  const [playing, setPlaying] = useState(true);

  const playRive = () => {
    console.log("in");

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
          event.target.value === "" ? (event.target.value = " ") : "";
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

  const changeresolution = (event: any) => {
    const mainCan: any = document.querySelector("#MainCanvas");
    if (mainCan) {
      const resolution = event.split("-");
      console.log(resolution);
      mainCan.style.width = resolution[0] + "px";
      mainCan.style.height = resolution[1] + "px";
    }
  };

  // EventListener to Deactivate Zoom Pan to be able to Resize
  const [isResizing, setIsResizing] = useState(false);
  useEffect(() => {
    const mainCanvas = document.getElementById("MainCanvas");
    if (!mainCanvas) return;

    const handleMouseEvent = (event: any) => {
      if (event.target.classList.contains("resizeItem")) {
        setIsResizing(true);
      } else {
        setIsResizing(false);
      }
    };

    document.body.addEventListener("mousemove", handleMouseEvent);
    mainCanvas.addEventListener("mousedown", handleMouseEvent);

    return () => {
      mainCanvas.removeEventListener("mousedown", handleMouseEvent);
      mainCanvas.removeEventListener("mousemove", handleMouseEvent);
    };
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
            {templateData.text.map((text: any) => (
              <div className="grid w-full gap-1.5" key={text.v}>
                <label
                  className="text-sm text-sidebar-foreground"
                  htmlFor={text.v}
                >
                  {text.name}
                </label>
                <Textarea
                  id={text.v}
                  defaultValue={text.default}
                  onChange={changeText}
                />
              </div>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <div className="grid grid-cols-2 gap-1.5">
                  <Image
                    width={100}
                    height={100}
                    alt=""
                    className="cursor-pointer rounded-md border transition-opacity hover:opacity-75"
                    src={"/img/Avatar.webp"}
                  ></Image>
                </div>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="w-60">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="relative size-fit">
                      <Button className="text-xs p-3 h-8 rounded-lg absolute top-1/2 left-1/2 transition-opacity opacity-0 hover:opacity-100 z-50">
                        Crop
                      </Button>
                      <Image
                        width={300}
                        height={100}
                        alt=""
                        className="cursor-pointer rounded-lg border transition-opacity hover:opacity-75 relative"
                        src={"/img/Avatar.webp"}
                      ></Image>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Button className="text-xs p-3 h-8 rounded-lg">Crop</Button>
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
