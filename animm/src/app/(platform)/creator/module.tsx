import { useRive, Fit, Layout } from '@rive-app/react-canvas';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Module({
  type,
  src,
  ab,
}: {
  type: string | undefined;
  src: string | undefined;
  ab: string | undefined;
}) {
  const { rive, RiveComponent } = useRive({
    src: src,
    artboard: ab,
    stateMachines: 'SM',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
  });
  useEffect(() => {
    if (rive && type === '0') {
      rive.load({
        src: src,
        artboard: ab,
        stateMachines: 'SM',
        autoplay: true,
      });
      rive.layout = new Layout({
        fit: Fit.Layout,
        layoutScaleFactor: 1,
      });
    }
  }, [src, ab, type]);

  return (
    <div className="size-full">
      {type === '0' && <RiveComponent />}
      {type === '1' && (
        <Image
          fill
          src={'/img/IMG_1.jpg'}
          alt="image"
          className="object-cover"
        />
      )}
      {type === '2' && (
        <video className="absolute size-full object-cover" autoPlay loop muted>
          <source src={'/video/Ski.mp4'} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
