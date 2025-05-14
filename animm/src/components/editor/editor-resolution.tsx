import Screens from '../../data/Screens.json';
import ScreensMM1 from '../../data/ScreensMM1.json';
import ScreensMM2 from '../../data/ScreensMM2.json';
import ScreensMM3 from '../../data/ScreensMM3.json';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EditorResolution(props: {
  resolution: ((value: string) => void) | undefined;
  templateId: string | undefined;
}) {
  let screensToUse = Screens;
  if (props.templateId === '5') screensToUse = ScreensMM1;
  if (props.templateId === '4') screensToUse = ScreensMM2;
  if (props.templateId === '6') screensToUse = ScreensMM3;
  const ScreensDef = screensToUse.map((screen: any) => {
    return {
      value: '' + screen.id,
      label: screen.name,
      width: screen.width,
      height: screen.height,
    };
  });
  return (
    <div className="absolute left-0 top-0 z-50 p-4 ">
      <Select onValueChange={props.resolution}>
        <SelectTrigger className="min-w-[150px] me-2 transition-shadow hover:shadow-lg hover:shadow-slate-500/10">
          <SelectValue placeholder="Select Screen" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="px-3">Default</SelectLabel>
            {ScreensDef.map(screen => (
              <SelectItem
                value={screen.width + '-' + screen.height}
                key={screen.value}
              >
                {screen.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
