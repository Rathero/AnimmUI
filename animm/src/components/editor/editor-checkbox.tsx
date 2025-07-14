import { Input } from '@/components/ui/input';
import { TemplateVariable } from '@/types/collections';
import { Label } from '@/components/ui/label';

export function EditorCheckbox({
  variable,
  changeInput,
}: {
  variable: TemplateVariable;
  changeInput: (arg0: string, arg1: TemplateVariable) => void;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <Label className="text-sm text-muted-foreground">{variable.name}</Label>
      <Input
        defaultChecked={false}
        className="justify-end"
        onChange={e => changeInput(e.target.value, variable)}
        color="rgba(0, 0, 0, 1)"
        type="checkbox"
      />
    </div>
  );
}
