import { useRive, Fit, Layout, FileAsset, Rive } from '@rive-app/react-canvas';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRiveStore } from '@/stores/rive-store';
import { exposeRiveInstance } from '@/lib/expose-rive';

export default function RiveComp({
  src,
  setAssetsParent,
  setRiveStatesParent,
  autoplay = true,
}: {
  src: string;
  setAssetsParent: Dispatch<SetStateAction<FileAsset[]>>;
  setRiveStatesParent: Dispatch<SetStateAction<Rive[]>>;
  autoplay?: boolean;
}) {
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const setRiveInstance = useRiveStore(state => state.setRiveInstance);
  const { rive, RiveComponent } = useRive({
    src: src,
    artboard: 'Banners',
    stateMachines: 'SM',
    autoplay: autoplay,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
    assetLoader: asset => {
      if (asset.isImage) {
        assets.push(asset);
        setAssets(assets);
        setAssetsParent(assets);
      }
      return false;
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
