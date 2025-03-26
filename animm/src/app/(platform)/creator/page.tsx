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
import { Switch } from '@/components/ui/switch';
import Module from './module';

const Components = [
  ['1', '', '', 'Image'],
  ['2', '', '', 'Video'],
  ['0', '/Test/WL_Product.riv', 'Template', 'Module01'],
  ['0', '/Test/WL_Totem.riv', 'Template', 'Module02'],
  ['0', '/Test/WL_Pb.riv', 'Template', 'Module03'],
  ['0', '/Test/WL_Modules.riv', 'Module_01', 'Module04'],
  ['0', '/Test/WL_Modules.riv', 'Module_02', 'Module05'],
  ['0', '/Test/WL_Modules.riv', 'Module_03', 'Module06'],
  ['0', '/Test/WL_Modules.riv', 'Module_04', 'Module07'],
  ['0', '/Test/WL_Modules.riv', 'Module_05', 'Module08'],
];

interface DraggableDivProps {
  id: number;
  div: DivForCreator;
  selectedId: number | null;
  isEdit: boolean;
  onSelectParent: (x: DivForCreator) => void;
  onSelectNested: (x: DivForCreator) => void;
  nestedLayout: 'horizontal' | 'vertical';
  removeNestedDiv: (nestedId: number, parentId: number) => void;
  nestedDivs: DivForCreator[];
}

interface DivForCreator {
  id: number;
  direction: 'horizontal' | 'vertical';
  nestedDivs: DivForCreator[];
  module: number;
}
const DraggableDiv = ({
  id,
  div,
  selectedId,
  isEdit,
  onSelectParent,
  onSelectNested,
  nestedLayout,
  removeNestedDiv,
  nestedDivs,
}: DraggableDivProps) => {
  return (
    <>
      <ResizablePanel
        className={`${selectedId === id ? 'border-blue-500 z-40 ' : ''}${
          isEdit ? '!border-2' : ''
        }`}
        onClick={e => {
          e.stopPropagation();
          onSelectParent(div);
        }}
      >
        <ResizablePanelGroup
          key={id}
          direction={nestedLayout}
          className={`${isEdit ? ' p-5 gap-5' : ''}`}
        >
          {nestedDivs.map((nestedDiv, index) => (
            <>
              {index !== 0 && isEdit && <ResizableHandle withHandle={isEdit} />}
              <ResizablePanel
                key={index}
                className={`relative ${
                  selectedId === nestedDiv.id ? ' border-blue-500 z-40 ' : ''
                }${isEdit ? '!border-2' : ''}`}
                onClick={e => {
                  e.stopPropagation();
                  onSelectNested(nestedDiv);
                }}
              >
                {isEdit && (
                  <div className="absolute top-0 left-0 p-2">
                    Div {id} - Nested {index}
                  </div>
                )}
                <div className="absolute top-0 right-0 p-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="opacity-0 transition-opacity hover:opacity-100 z-40"
                    onClick={() => removeNestedDiv(index, id)}
                  >
                    <Trash />
                  </Button>
                </div>
                {/* Content here */}
                <Module
                  type={Components[nestedDiv.module][0]}
                  src={Components[nestedDiv.module][1]}
                  ab={Components[nestedDiv.module][2]}
                />
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
    {
      id: 0,
      direction: 'vertical',
      nestedDivs: [],
      module: 2,
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number>(0);
  const [activeModule, setActiveModule] = useState<string>('0');
  const [totalDivs, setTotalDivs] = useState<number>(0);
  const [mainDirection, setMainDirection] = useState<'horizontal' | 'vertical'>(
    'horizontal'
  );
  const [isEdit, setisEdit] = useState<boolean>(true);

  const addDiv = () => {
    setDivs(prevDivs => [
      ...prevDivs,
      {
        id: totalDivs + 1,
        direction: 'vertical',
        nestedDivs: [],
        module: 2,
      },
    ]);
    setTotalDivs(totalDivs + 1);
  };
  const setSelectedNestedDiv = (div: DivForCreator) => {
    setSelectedId(div.id);
    setSelectedType(2);
    setActiveModule(div.module.toString());
  };

  const setSelectedDiv = (div: DivForCreator) => {
    setSelectedId(div.id);
    setSelectedType(1);
    setActiveModule(div.module.toString());
  };

  const changeModule = (module: string) => {
    setActiveModule(module);
    const moduleId = parseInt(module);
    const copyDivs = [...divs];
    copyDivs.map(x => {
      x.nestedDivs.map(y => {
        if (y.id === selectedId) {
          y.module = moduleId;
          setDivs(copyDivs);
        }
      });
    });
  };

  const addNestedDiv = () => {
    if (selectedId !== null) {
      const copyDivs = [...divs];
      copyDivs
        .filter(x => x.id == selectedId)[0]
        .nestedDivs.push({
          id: totalDivs + 1,
          direction: 'vertical',
          nestedDivs: [],
          module: 2,
        });
      setDivs(copyDivs);
      setTotalDivs(totalDivs + 1);
    }
  };

  const removeNestedDiv = (nestedId: number, parentId: number) => {
    if (selectedId !== null) {
      const copyDivs = [...divs];
      copyDivs.filter(x => x.id == parentId)[0].nestedDivs.splice(nestedId, 1);
      const nested = copyDivs.filter(x => x.id == parentId)[0].nestedDivs;
      if (nested.length === 0) {
        copyDivs.map((div, index) => {
          if (div.id === parentId) {
            copyDivs.splice(index, 1);
          }
        });
      }
      setDivs(copyDivs);
    }
  };

  const setNestedLayoutDirection = (direction: 'horizontal' | 'vertical') => {
    const copyDivs = [...divs];
    copyDivs.map(x => {
      if (x.id == selectedId) {
        x.direction = direction;
      }
    });
    setDivs(copyDivs);
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
                  <EditorResolution resolution={changeresolution} />
                  <EditorZoom
                    zoomIn={zoomIn}
                    zoomOut={zoomOut}
                    setTransform={setTransform}
                    resetTransform={resetTransform}
                    centerView={centerView}
                    zoomToElement={zoomToElement}
                  />
                  <div className="absolute right-0 top-0 z-50 p-4 flex items-center space-x-2">
                    <Label htmlFor="airplane-mode">Edit Mode</Label>
                    <Switch
                      id="edit-mode"
                      checked={isEdit}
                      onCheckedChange={setisEdit}
                    />
                  </div>
                  <TransformComponent wrapperClass="!w-full !h-full">
                    <div
                      id="MainCanvas"
                      className="h-[1920px] w-[1080px] resizeItem border bg-white shadow-md shadow-slate-500/1 "
                    >
                      <ResizablePanelGroup
                        key={divs ? divs[0].id : '0'}
                        direction={mainDirection}
                        className={`size-full${isEdit ? ' p-5 ' : ''}`}
                      >
                        {divs &&
                          divs.map((div, index) => (
                            <>
                              {index !== 0 && isEdit && (
                                <ResizableHandle withHandle={isEdit} />
                              )}
                              <DraggableDiv
                                key={index}
                                id={div.id}
                                div={div}
                                isEdit={isEdit}
                                selectedId={selectedId}
                                onSelectParent={(x: DivForCreator) => {
                                  setSelectedDiv(x);
                                }}
                                onSelectNested={(x: DivForCreator) => {
                                  setSelectedNestedDiv(x);
                                }}
                                nestedLayout={divs[index].direction}
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
                    <SelectValue
                      defaultValue={mainDirection}
                      placeholder={mainDirection}
                    />
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
              <p className="text-sm">
                {selectedType === 1 && 'Section'}
                {selectedType === 2 && 'Nested'}

                {selectedId}
              </p>
              {selectedType === 1 && (
                <div className="grid gap-3">
                  <Button size="sm" variant="outline" onClick={addNestedDiv}>
                    + Add Nested Section
                  </Button>
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">
                      Layout Direction
                    </Label>
                    <Select
                      value={
                        divs.filter(div => div.id === selectedId)[0].direction
                      }
                      onValueChange={e => {
                        setNestedLayoutDirection(
                          e as 'horizontal' | 'vertical'
                        );
                      }}
                    >
                      <SelectTrigger className="w-full text-left">
                        <SelectValue />
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
              )}
              {selectedType === 2 && (
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label className="text-xs text-muted-foreground">
                      Module Selector
                    </Label>
                    <Select
                      value={activeModule}
                      onValueChange={e => {
                        changeModule(e);
                      }}
                    >
                      <SelectTrigger className="w-full text-left">
                        <SelectValue placeholder="Vertical" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Components.map((x, index) => {
                            return (
                              <SelectItem key={index} value={index.toString()}>
                                {x[3]}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
