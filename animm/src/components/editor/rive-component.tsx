import { useRive, Fit, Layout, FileAsset } from '@rive-app/react-canvas';
import { Dispatch, SetStateAction, useState } from 'react';

export default function RiveComp({
  src,
  setAssetsParent,
}: {
  src: string;
  setAssetsParent: Dispatch<SetStateAction<FileAsset[]>>;
}) {
  const [assets, setAssets] = useState<Array<FileAsset>>([]);
  const { RiveComponent } = useRive({
    src: src,
    artboard: 'Template',
    stateMachines: 'SM',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
    assetLoader: (asset, bytes) => {
      if (asset.isImage) {
        assets.push(asset);
        setAssets(assets);
        setAssetsParent(assets);
      }
      return false;
    },
  });

  return <RiveComponent />;
}
