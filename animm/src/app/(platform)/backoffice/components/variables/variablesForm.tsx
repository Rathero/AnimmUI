'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VariableRequest } from '@/types/collections';
import { useState } from 'react';

export interface VariableFormProps {
  variable: VariableRequest;
  onChange: (variable: VariableRequest) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  error?: string | null;
}

const VariableType = {
  TEXT: 0,
  BOOLEAN: 1,
  SELECTOR: 2,
};

export default function VariableForm({
  variable,
  onChange,
  onSave,
  onCancel,
  title,
  error,
}: VariableFormProps) {
  const [selectorOptions, setSelectorOptions] = useState<string[]>(
    variable.type === VariableType.SELECTOR && variable.defaultValue
      ? variable.defaultValue
          .split(',')
          .map(opt => opt.trim())
          .filter(opt => opt)
      : []
  );
  const [newOption, setNewOption] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...variable, name: e.target.value });
  };

  const handleDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...variable, defaultValue: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    const typeNum = parseInt(value);
    const updatedVariable: VariableRequest = {
      ...variable,
      type: typeNum,
    };

    if (typeNum === VariableType.BOOLEAN) {
      updatedVariable.defaultValue = 'false';
      updatedVariable.value = 'false';
      setSelectorOptions([]);
    } else if (typeNum === VariableType.TEXT) {
      updatedVariable.defaultValue = '';
      updatedVariable.value = '';
      setSelectorOptions([]);
    } else if (typeNum === VariableType.SELECTOR) {
      updatedVariable.defaultValue = selectorOptions.join(',');
      updatedVariable.value = selectorOptions[0] || '';
    }

    onChange(updatedVariable);
  };

  const addOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...selectorOptions, newOption.trim()];
      setSelectorOptions(updatedOptions);
      setNewOption('');

      onChange({
        ...variable,
        defaultValue: updatedOptions.join(','),
        value: updatedOptions.includes(variable.value)
          ? variable.value
          : updatedOptions[0] || '',
      });
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = selectorOptions.filter((_, i) => i !== index);
    setSelectorOptions(updatedOptions);
    onChange({
      ...variable,
      defaultValue: updatedOptions.join(','),
      value: updatedOptions.includes(variable.value)
        ? variable.value
        : updatedOptions[0] || '',
    });
  };

  const handleSubmit = () => {
    if (!variable.name.trim()) {
      alert('Name is required');
      return;
    }

    if (variable.type === VariableType.SELECTOR && selectorOptions.length === 0) {
      alert('Selector must have at least one option');
      return;
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={variable.name}
              onChange={handleNameChange}
              placeholder="Example: color_theme"
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={variable.type.toString()} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VariableType.TEXT.toString()}>Text</SelectItem>
                <SelectItem value={VariableType.BOOLEAN.toString()}>Boolean</SelectItem>
                <SelectItem value={VariableType.SELECTOR.toString()}>Selector</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {variable.type === VariableType.TEXT && (
            <div>
              <Label htmlFor="defaultValue">Default Value</Label>
              <Input
                id="defaultValue"
                value={variable.defaultValue}
                onChange={handleDefaultValueChange}
                placeholder="Default text value"
              />
            </div>
          )}

          {variable.type === VariableType.BOOLEAN && (
            <div>
              <Label htmlFor="defaultValue">Default Value *</Label>
              <Select
                value={variable.defaultValue}
                onValueChange={value =>
                  onChange({
                    ...variable,
                    defaultValue: value,
                    value: value, // mantiene value en sync con defaultValue para boolean
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {variable.type === VariableType.SELECTOR && (
            <div>
              <Label>Options *</Label>
              <div className="space-y-2">
                {selectorOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={e => {
                        const updatedOptions = [...selectorOptions];
                        updatedOptions[index] = e.target.value;
                        setSelectorOptions(updatedOptions);
                        onChange({
                          ...variable,
                          defaultValue: updatedOptions.join(','),
                          value: updatedOptions.includes(variable.value)
                            ? variable.value
                            : updatedOptions[0] || '',
                        });
                      }}
                      placeholder="Option value"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={e => setNewOption(e.target.value)}
                    placeholder="Add new option"
                    onKeyPress={e => e.key === 'Enter' && addOption()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-gray-500">
                  {selectorOptions.length} option(s) added
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
