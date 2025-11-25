'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import type { Variable } from '@/types/collections';



export interface VariableFormProps {
  variable: Variable;
  onChange: (variable: Variable) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  error?: string | null;
}

export default function VariableForm({
  variable,
  onChange,
  onSave,
  onCancel,
  title,
  error,
}: VariableFormProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...variable, name: e.target.value });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...variable, value: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <Label htmlFor="name">Nombre de la variable</Label>
            <Input
              id="name"
              value={variable.name}
              onChange={handleNameChange}
              placeholder="Ejemplo: variable1"
            />
          </div>

          <div>
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              value={variable.value}
              onChange={handleValueChange}
              placeholder="Introduce el valor de la variable"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isStatic"
              type="checkbox"
              className="mr-2"
            />
            <Label htmlFor="isStatic">¿Es estática?</Label>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button onClick={onSave}>
              <Save className="w-4 h-4 mr-2" /> Guardar
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
