import { useRive, Fit, Layout } from '@rive-app/react-canvas';



export function RiveComp(props:any) {

    const src : string = props.src;

    const { rive, RiveComponent } = useRive({
        src: src,
        artboard: "Template",
        stateMachines: "SM",
        autoplay: true,
        layout: new Layout({
          fit: Fit.Layout,
          layoutScaleFactor: 1,
        })
      });

    return (
        <RiveComponent />
    );
}