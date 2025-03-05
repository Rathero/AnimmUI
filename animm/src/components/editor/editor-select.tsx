import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TemplateVariable } from '@/types/collections';
import { Label } from '@/components/ui/label';

export function EditorSelect(props: {
  variable: TemplateVariable;
  changeInput: (arg0: string, arg1: TemplateVariable) => void;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <Label className="text-sm text-muted-foreground">
        {props.variable.name}
      </Label>
      <Select onValueChange={e => props.changeInput(e, props.variable)}>
        <SelectTrigger className="w-full !text-left">
          <SelectValue placeholder={props.variable.defaultValue} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.variable.possibleValues.map(v => (
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
