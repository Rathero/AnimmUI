import {
  useRive,
  Fit,
  Layout,
  FileAsset,
  Rive,
  useViewModel,
  useViewModelInstanceString,
  useViewModelInstance,
} from '@rive-app/react-webgl2';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRiveStore } from '@/stores/rive-store';
import { exposeRiveInstance } from '@/lib/expose-rive';

export default function RiveComp({
  src,
  setAssetsParent,
  setRiveStatesParent,
  autoplay = true,
  artboard = 'Template',
  onStateChange,
  format = 'webm',
}: {
  src: string;
  setAssetsParent: Dispatch<SetStateAction<FileAsset[]>>;
  setRiveStatesParent: Dispatch<SetStateAction<Rive[]>>;
  autoplay?: boolean;
  artboard?: string;
  onStateChange?: () => void;
  format?: string;
}) {
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const setRiveInstance = useRiveStore(state => state.setRiveInstance);
  const { rive, RiveComponent } = useRive({
    src: format === 'gif' ? src.replace('.riv', '_gif.riv') : src,
    artboard: artboard,
    stateMachines: 'SM',
    autoplay: autoplay,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
    autoBind: true,
    assetLoader: asset => {
      if (asset.isImage) {
        assets.push(asset);
        setAssets(assets);
        setAssetsParent(assets);
      }
      return false;
    },
    onRiveReady: () => {},
    onStateChange: state => {
      if (onStateChange) {
        onStateChange();
      }
    },
  });

  useEffect(() => {
    if (rive) {
      setRiveStatesParent([rive]);
      setRiveInstance(rive);
      exposeRiveInstance(rive);
    }
    return () => {
      setRiveInstance(null);
      exposeRiveInstance(null);
    };
  }, [rive, setRiveInstance]);

  return <RiveComponent />;
}
