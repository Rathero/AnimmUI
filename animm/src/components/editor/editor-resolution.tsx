import Screens from "../../data/Screens.json";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditorResolution(props: {
  resolution: ((value: string) => void) | undefined;
}) {
  const ScreensDef = Screens.map((screen: any) => {
    return {
      value: "" + screen.id,
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
            {ScreensDef.map((screen) => (
              <SelectItem
                value={screen.width + "-" + screen.height}
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
