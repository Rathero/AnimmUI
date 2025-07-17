import { Input } from '@/components/ui/input';
import { TemplateVariable } from '@/types/collections';
import { Label } from '@/components/ui/label';

export function EditorCheckbox({
  variable,
  changeCheckbox,
}: {
  variable: TemplateVariable;
  changeCheckbox: (arg0: boolean, arg1: TemplateVariable) => void;
}) {
  return (
    <div className="grid w-full gap-1.5">
      <Label className="text-sm text-muted-foreground">{variable.name}</Label>
      <Input
        defaultChecked={false}
        className="justify-end"
        onChange={e => {
          changeCheckbox(e.target.checked, variable);
        }}
        color="rgba(0, 0, 0, 1)"
        type="checkbox"
      />
    </div>
  );
}
