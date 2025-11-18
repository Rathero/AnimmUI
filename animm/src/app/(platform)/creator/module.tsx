import { useRive, Fit, Layout } from '@rive-app/react-webgl2';
import Image from 'next/image';

function RiveWrapper({
  src,
  ab,
}: {
  src: string | undefined;
  ab: string | undefined;
}) {
  const { RiveComponent } = useRive({
    src: src,
    artboard: ab,
    stateMachines: 'SM',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Layout,
      layoutScaleFactor: 1,
    }),
  });

  return <RiveComponent />;
}

export default function Module({
  type,
  src,
  ab,
}: {
  type: string | undefined;
  src: string | undefined;
  ab: string | undefined;
}) {
  return (
    <div className="size-full">
      {type === '0' && src && ab && (
        <RiveWrapper key={`${src}-${ab}`} src={src} ab={ab} />
      )}
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
