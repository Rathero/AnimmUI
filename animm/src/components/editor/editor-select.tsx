import Screens from '../../data/Screens.json';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateVariable } from '@/types/collections';
import { Label } from '@/components/ui/label';

export function EditorSelect({
  variable,
  changeInput,
}: {
  variable: TemplateVariable;
  changeInput: (arg0: string, arg1: TemplateVariable) => void;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <Label className="text-sm text-muted-foreground">{variable.name}</Label>
      <Select
        onValueChange={e => changeInput(e, variable)}
        defaultValue={variable.defaultValue}
      >
        <SelectTrigger className="w-full !text-left">
          <SelectValue placeholder={variable.defaultValue} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {variable.possibleValues.map(v => (
              <SelectItem value={v.value} key={v.value}>
                {v.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
