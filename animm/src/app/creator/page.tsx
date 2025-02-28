'use client';

import { useEffect, useState } from 'react';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorResolution } from '@/components/editor/editor-resolution';

import React from 'react';
import { DndContext } from '@dnd-kit/core';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { RiveComp } from '@/components/editor/rive-component';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const ItemType = 'DIV_ITEM';
const Components = [
  ['/Test/WL_Product.riv', 'Template'],
  ['/Test/WL_Totem.riv', 'Template'],
  ['/Test/WL_Pb.riv', 'Template'],
  ['/Test/WL_Modules.riv', 'Module_01'],
  ['/Test/WL_Modules.riv', 'Module_02'],
  ['/Test/WL_Modules.riv', 'Module_03'],
  ['/Test/WL_Modules.riv', 'Module_04'],
  ['/Test/WL_Modules.riv', 'Module_05'],
];

interface DraggableDivProps {
  id: number;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
  nestedLayout: 'horizontal' | 'vertical';
  removeNestedDiv: (nestedId: number) => void;
  nestedDivs: number[];
}

const DraggableDiv = ({
  id,
  isSelected,
  onSelect,
  nestedLayout,
  removeNestedDiv,
  nestedDivs,
}: DraggableDivProps) => {
  return (
    <>
      <ResizablePanel
        className={`border-2
              ${isSelected ? ' border-blue-500 z-40 ' : ''}`}
        onClick={e => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        <ResizablePanelGroup key={id} direction={nestedLayout}>
          {nestedDivs.map((nestedId, index) => (
            <>
              {index !== 0 && <ResizableHandle withHandle />}
              <ResizablePanel key={index} className="relative border">
                <div className="absolute top-0 left-0 p-2">
                  Div {id} - Nested {nestedId}
                </div>
                <div className="absolute top-0 right-0 p-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="opacity-0 transition-opacity hover:opacity-100"
                    onClick={() => removeNestedDiv(nestedId)}
                  >
                    <Trash />
                  </Button>
                </div>
                {/* Content here */}
                <RiveComp src={Components[2][0]} ab={Components[2][1]} />
              </ResizablePanel>
            </>
          ))}
        </ResizablePanelGroup>
      </ResizablePanel>
    </>
  );
};

export default function Editor() {
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

    mainCanvas.removeEventListener('mousedown', handleMouseEvent);
    mainCanvas.removeEventListener('mousemove', handleMouseEvent);
  }, []);

  const [divs, setDivs] = useState<number[]>([]);
  const [nestedDivs, setNestedDivs] = useState<Record<number, number[]>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mainLayout, setMainLayout] = useState<'horizontal' | 'vertical'>(
    'horizontal'
  );
  const [nestedLayouts, setNestedLayouts] = useState<
    Record<number, 'horizontal' | 'vertical'>
  >({});

  const addDiv = () => {
    const newId = divs.length;
    setDivs(prevDivs => [...prevDivs, newId]);
    setNestedDivs(prev => ({ ...prev, [newId]: [0] }));
  };
  const addNestedDiv = () => {
    if (selectedId !== null) {
      setNestedDivs(prev => ({
        ...prev,
        [selectedId]: [
          ...(prev[selectedId] || []),
          prev[selectedId]?.length || 0,
        ],
      }));
    }
  };
  const removeNestedDiv = (nestedId: number) => {
    if (selectedId !== null) {
      setNestedDivs(prev => {
        const updatedNestedDivs = prev[selectedId].filter(
          id => id !== nestedId
        );
        const newState = { ...prev, [selectedId]: updatedNestedDivs };
        if (updatedNestedDivs.length === 0) {
          setDivs(prevDivs => prevDivs.filter(id => id !== selectedId));
          setSelectedId(null);
          delete newState[selectedId];
        }
        return newState;
      });
    }
  };

  const toggleNestedLayout = () => {
    if (selectedId !== null) {
      setNestedLayouts(prev => ({
        ...prev,
        [selectedId]:
          prev[selectedId] === 'horizontal' ? 'vertical' : 'horizontal',
      }));
    }
  };

  return (
    <>
      <div className="absolute flex top-0 bottom-0 right-0 left-0 overflow-hidden">
        <div className="w-full h-full overflow-hidden p-4 pt-0">
          <div
            className="w-full h-full relative rounded-lg border bg-sidebar bg-editor"
            onClick={e => {
              setSelectedId(null);
            }}
          >
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
                      className="h-[1920px] w-[1080px] resizeItem border bg-white shadow-md shadow-slate-500/1 "
                    >
                      <ResizablePanelGroup
                        key={'panel'}
                        direction={mainLayout}
                        className="size-full"
                      >
                        {divs.map((id, index) => (
                          <>
                            {index !== 0 && <ResizableHandle withHandle />}
                            <DraggableDiv
                              key={index}
                              id={index}
                              isSelected={selectedId === index}
                              onSelect={setSelectedId}
                              nestedLayout={nestedLayouts[index] || 'vertical'}
                              removeNestedDiv={removeNestedDiv}
                              nestedDivs={nestedDivs[id] || []}
                            />
                          </>
                        ))}
                      </ResizablePanelGroup>
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>

        <aside className="w-64 px-4 ps-0 pt-0 transition-all pace-y-6">
          <div className="space-y-2">
            <p className="text-sm">Main Section</p>
            <div className="grid gap-3">
              <Button size="sm" variant="outline" onClick={addDiv}>
                + Add Section
              </Button>
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">
                  Layout Direction
                </Label>
                <Select
                  onValueChange={e =>
                    setMainLayout(e as 'horizontal' | 'vertical')
                  }
                >
                  <SelectTrigger className="w-full text-left">
                    <SelectValue placeholder="Horizontal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          {selectedId !== null && (
            <div className="space-y-2">
              <p className="text-sm">Section {selectedId}</p>
              <div className="grid gap-3">
                <Button size="sm" variant="outline" onClick={addNestedDiv}>
                  + Add Nested Section
                </Button>
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Layout Direction
                  </Label>
                  <Select
                    onValueChange={e =>
                      setNestedLayouts(prev => ({
                        ...prev,
                        [selectedId]: e as 'horizontal' | 'vertical',
                      }))
                    }
                  >
                    <SelectTrigger className="w-full text-left">
                      <SelectValue placeholder="Vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                        <SelectItem value="vertical">Vertical</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
