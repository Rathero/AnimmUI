import { Textarea } from '../ui/textarea';
import { TemplateVariable } from '@/types/collections';

export function EditorText(props: {
  variable: TemplateVariable;
  changeText: (arg0: string, arg1: TemplateVariable) => void;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <label
        className="text-sm text-muted-foreground"
        htmlFor={props.variable.path}
      >
        {props.variable.name}
      </label>
      <Textarea
        id={props.variable.path}
        defaultValue={props.variable.defaultValue}
        onChange={e => props.changeText(e.target.value, props.variable)}
      />
    </div>
  );
}
