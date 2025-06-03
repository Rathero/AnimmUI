import { TemplateComposition } from '@/types/collections';

export default function EditorResolution({
  setResolutionFunction,
  compositions = [],
}: {
  setResolutionFunction: (width: number, height: number) => void;
  compositions: TemplateComposition[] | [];
}) {
  return (
    <div className="absolute left-0 top-0 z-50 p-4 ">
      {compositions.map(composition => (
        <div
          id={`composition-${composition.id}`}
          key={`composition-${composition.id}`}
        >
          {composition.name}
          {composition.templateResolutions.map(resolution => (
            <div
              id={`resolution-${composition.id}${resolution.id}`}
              key={`resolution-${composition.id}${resolution.id}`}
              onClick={() =>
                setResolutionFunction(resolution.width, resolution.height)
              }
            >
              {resolution.name} - {resolution.width}x{resolution.height}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
