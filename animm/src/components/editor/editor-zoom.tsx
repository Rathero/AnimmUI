import { Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { useTransformEffect } from 'react-zoom-pan-pinch';
import { useState } from 'react';
import { ReactZoomPanPinchHandlers } from 'react-zoom-pan-pinch';

export function EditorZoom(props: ReactZoomPanPinchHandlers) {
  const step = 0.2;
  const [zoom, setZoom] = useState(1);

  useTransformEffect(({ state, instance }) => {
    setZoom(Math.floor(state.scale * 100));
  });

  return (
    <div className="absolute right-0 bottom-0 z-50 p-4">
      <div className="flex rounded-lg bg-white border transition-shadow hover:shadow-md hover:shadow-slate-500/10 p-1 gap-4">
        <Button
          variant="ghost"
          className="h-6 w-4"
          onClick={() => props.zoomOut(step)}
        >
          <Minus />
        </Button>
        <Button
          variant="link"
          className="h-6 w-10"
          onClick={() => {
            props.zoomToElement('MainCanvas');
          }}
        >
          {zoom + '%'}
        </Button>
        <Button
          variant="ghost"
          className="h-6 w-8"
          onClick={() => props.zoomIn(step)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
