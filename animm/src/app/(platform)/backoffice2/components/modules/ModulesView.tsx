import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ModulesViewProps {
  template: any;
  onBack: () => void;
  onDataChange: () => Promise<void>;
}

export default function ModulesView({ template, onBack }: ModulesViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modules in {template.name}</h2>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
        </Button>
      </div>

      <div className="p-4 border rounded-md">
        <p>Coming soon: list of modules for template ID {template.id}</p>
      </div>
    </div>
  );
}
