'use client';

import { useEffect, useState } from 'react';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { EditorZoom } from '@/components/editor/editor-zoom';
import { EditorResolution } from '@/components/editor/editor-resolution';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
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
  div: DivForCreator;
  onSelectParent: (x: DivForCreator) => void;
  onSelectNested: (x: DivForCreator) => void;
  nestedLayout: 'horizontal' | 'vertical';
  removeNestedDiv: (nestedId: number) => void;
  nestedDivs: DivForCreator[];
}

interface DivForCreator {
  id: number;
  direction: 'horizontal' | 'vertical';
  nestedDivs: DivForCreator[];
  selected: boolean;
}
const DraggableDiv = ({
  id,
  div,
  onSelectParent,
  onSelectNested,
  nestedLayout,
  removeNestedDiv,
  nestedDivs,
}: DraggableDivProps) => {
  return (
    <>
      <ResizablePanel
        className={`border-2${div.selected ? ' border-blue-500 z-40 ' : ''}`}
        onClick={e => {
          e.stopPropagation();
          onSelectParent(div);
        }}
      >
        <ResizablePanelGroup key={id} direction={nestedLayout}>
          {nestedDivs.map((nestedDiv, index) => (
            <>
              {index !== 0 && <ResizableHandle withHandle />}
              <ResizablePanel
                key={index}
                className={`relative border ${
                  nestedDiv.selected ? ' border-blue-500 z-40 ' : ''
                }`}
                onClick={e => {
                  e.stopPropagation();
                  onSelectNested(nestedDiv);
                }}
              >
                <div className="absolute top-0 left-0 p-2">
                  Div {id} - Nested {index}
                </div>
                <div className="absolute top-0 right-0 p-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="opacity-0 transition-opacity hover:opacity-100"
                    onClick={() => removeNestedDiv(index)}
                  >
                    <Trash />
                  </Button>
                </div>
                {/* Content here */}
                {/* <RiveComp src={Components[2][0]} ab={Components[2][1]} /> */}
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

  const [divs, setDivs] = useState<DivForCreator[]>([
    { id: 0, direction: 'vertical', nestedDivs: [], selected: false },
  ]);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [totalDivs, setTotalDivs] = useState<number>(0);
  const [mainDirection, setMainDirection] = useState<'horizontal' | 'vertical'>(
    'horizontal'
  );

  const addDiv = () => {
    setDivs(prevDivs => [
      ...prevDivs,
      {
        id: totalDivs + 1,
        direction: 'vertical',
        nestedDivs: [],
        selected: false,
      },
    ]);
    setTotalDivs(totalDivs + 1);
  };
  const setSelectedNestedDiv = (div: DivForCreator, parent: DivForCreator) => {
    if (div) {
      divs.forEach(x => {
        x.selected = x.id == div.id;
        x.nestedDivs.forEach(y => {
          y.selected = x.id == div.id;
        });
      });
      parent.nestedDivs.forEach(x => {
        x.selected = x.id == div.id;
      });
      setDivs(divs);
      setSelectedId(div.id);
    }
  };
  const setSelectedDiv = (div: DivForCreator) => {
    if (div) {
      divs.forEach(x => {
        x.selected = x.id == div.id;
        x.nestedDivs.forEach(y => {
          y.selected = x.id == div.id;
        });
      });
      setDivs(divs);
      setSelectedId(div.id);
    }
  };
  const addNestedDiv = () => {
    if (selectedId !== null) {
      const copyDivs = divs;
      setDivs([]);
      copyDivs.forEach(x => {
        if (x.id == selectedId) {
          x.nestedDivs.push({
            id: totalDivs + 1,
            direction: 'vertical',
            nestedDivs: [],
            selected: false,
          });
        } else {
          x.nestedDivs.forEach(y => {
            if (y.id == selectedId) {
              y.nestedDivs.push({
                id: totalDivs + 1,
                direction: 'vertical',
                nestedDivs: [],
                selected: false,
              });
            }
          });
        }
      });
      setDivs(copyDivs);
      setTotalDivs(totalDivs + 1);
    }
  };
  const removeNestedDiv = (nestedId: number) => {
    if (selectedId !== null) {
      let newDivs = divs;
      const selectedDiv = divs[selectedId];
      selectedDiv.nestedDivs = selectedDiv.nestedDivs.filter(
        div => div.id !== nestedId
      );
      if (selectedDiv.nestedDivs.length === 0) {
        newDivs = divs.filter(div => div.id !== selectedId);
        setDivs(newDivs);
      } else {
        setDivs(prev => ({
          ...prev,
          [selectedId]: selectedDiv,
        }));
      }
    }
  };

  const setNestedLayoutDirection = (direction: 'horizontal' | 'vertical') => {
    const copyDivs = divs;
    setDivs([]);
    copyDivs.forEach(x => {
      if (x.id == selectedId) {
        x.direction = direction;
      } else {
        x.nestedDivs.forEach(y => {
          if (y.id == selectedId) {
            y.direction = direction;
          }
        });
      }
    });
    setDivs(copyDivs);
  };

  const toggleNestedLayout = () => {
    if (selectedId !== null) {
      const selectedDiv = divs[selectedId];
      selectedDiv.direction =
        selectedDiv.direction === 'horizontal' ? 'vertical' : 'horizontal';

      setDivs(prev => ({
        ...prev,
        [selectedId]: selectedDiv,
      }));
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
                        key={divs ? divs[0].id : '0'}
                        direction={mainDirection}
                        className="size-full"
                      >
                        {divs &&
                          divs.map((div, index) => (
                            <>
                              {index !== 0 && <ResizableHandle withHandle />}
                              <DraggableDiv
                                key={index}
                                id={index}
                                div={div}
                                onSelectParent={(x: DivForCreator) => {
                                  setSelectedDiv(x);
                                }}
                                onSelectNested={(x: DivForCreator) => {
                                  setSelectedNestedDiv(x, div);
                                }}
                                nestedLayout={
                                  divs[index].direction || 'vertical'
                                }
                                removeNestedDiv={removeNestedDiv}
                                nestedDivs={divs[index].nestedDivs || []}
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
                  onValueChange={e => {
                    setMainDirection(e as 'horizontal' | 'vertical');
                  }}
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
                    onValueChange={e => {
                      setNestedLayoutDirection(e as 'horizontal' | 'vertical');
                    }}
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
