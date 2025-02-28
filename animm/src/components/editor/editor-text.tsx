import { Textarea } from '../ui/textarea';
import { TemplateVariable } from '@/types/collections';
import { Label } from '@/components/ui/label';

export function EditorText(props: {
  variable: TemplateVariable;
  changeText: (arg0: string, arg1: TemplateVariable) => void;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <Label
        className="text-sm text-muted-foreground"
        htmlFor={props.variable.value}
      >
        {props.variable.name}
      </Label>
      <Textarea
        id={props.variable.value}
        defaultValue={props.variable.defaultValue}
        onChange={e => props.changeText(e.target.value, props.variable)}
      />
    </div>
  );
}
