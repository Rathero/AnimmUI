'use client'

import { EditorZoom } from "@/components/editor/editor-zoom";
import { EditorPlay } from "@/components/editor/editor-play";
import { EditorResolution } from "@/components/editor/editor-resolution";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useState } from "react";

import { RiveComp } from "@/components/editor/rive-component";

import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";


export default function Editor() {

  const [rescaling, setRescaling] = useState<boolean>(false);

  const changeresolution = (event:any) => {
      console.log(event)
      const mainCan: any = document.querySelector('#MainCanvas');
      if (mainCan) {
        setRescaling(true);
        const resolution = event.split("-");
        console.log(resolution)
        mainCan.style.width = resolution[0] + 'px';
        mainCan.style.height = resolution[1] + 'px';
        setTimeout(function () {
          setRescaling(false);
        }, 300);
      }
  };


  return (
    <>
    <div className="absolute flex top-0 bottom-0 right-0 left-0 overflow-hidden">
      <div className="w-full h-full overflow-hidden p-4 pt-0">
        <div className="w-full h-full relative rounded-lg border bg-sidebar bg-editor">
          <TransformWrapper
 
            centerOnInit={true}
            initialScale={1}
            minScale={0.1}
            maxScale={3}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView, ...rest }) => (
              <>
                <EditorResolution 
                  resolution={changeresolution}/>
                <EditorPlay />
                <EditorZoom
                  zoomIn={zoomIn}
                  zoomOut={zoomOut}
                  resetTransform={centerView}
                />
                <TransformComponent wrapperClass="!w-full !h-full" >
                  <div id="MainCanvas" className="h-[1280px] w-[720px] m-auto rounded-lg border bg-white shadow-md shadow-slate-500/10">
                    <RiveComp 
                      src='/test/WL_Product.riv'
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>
      
      <aside className="w-60 px-4 ps-0 pt-0 transition-all">
        <div className="grid w-full max-w-sm items-center gap-2.5">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <p className="text-sm text-sidebar-foreground">Email</p>
            <Input type="email" id="email" placeholder="Email" className="h-8" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <p className="text-sm text-sidebar-foreground">Email</p>
            <Textarea placeholder="Type your message here." />
          </div>
        </div>
      </aside>
    </div>
    </>

  );
}
