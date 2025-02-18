'use client'

import { EditorZoom } from "@/components/editor/editor-zoom";
import { EditorPlay } from "@/components/editor/editor-play";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


export default function Editor() {

  return (
    <>
    <div className="absolute flex top-0 bottom-0 right-0 left-0 overflow-hidden">
      <div className=" size-full p-4 pt-0">
        <div className="w-full h-full overflow-hidden relative rounded-lg border bg-sidebar bg-editor">
          <EditorZoom />
          <EditorPlay />

          <div className="h-full w-full grid place-content-center" style={{zoom:0.5}}>
            <div id="ZoomCanvas" style={{zoom:0.5}}>
              <div className="h-[700px] w-[420px] bg-white rounded-lg border overflow-hidden shadow-md shadow-slate-500/10 resize">

              </div>
            </div>
          </div>
        </div>
      </div>
      
      <aside className="w-60 px-4 ps-0 pt-0">
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
