import { useRive, Fit, Layout, FileAsset, Rive } from '@rive-app/react-canvas';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function RiveComp({
  src,
  setAssetsParent,
  setRiveStatesParent,
}: {
  src: string;
  setAssetsParent: Dispatch<SetStateAction<FileAsset[]>>;
  setRiveStatesParent: Dispatch<SetStateAction<Rive[]>>;
}) {
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const { rive, RiveComponent } = useRive({
    src: src,
    artboard: 'Template',
    stateMachines: 'SM',
    autoplay: true,
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
    if (rive) setRiveStatesParent([rive]);
  }, [rive]);

  return <RiveComponent />;
}
