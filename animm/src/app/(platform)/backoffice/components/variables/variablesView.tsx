'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import useVariablesService from '@/app/services/VariableService';
import {
  Variable,
  VariableRequest,
  TemplateVariableValueRequest,
  TemplateVariableValue,
} from '@/types/collections';
import VariableForm from './variablesForm';

interface VariablesViewProps {
  moduleId: number;
  onBack: () => void;
  onDataChange?: () => Promise<void>;
}

const VariableType = {
  TEXT: 0,
  BOOLEAN: 1,
  SELECTOR: 2,
};

interface VariableWithOptions extends Variable {
  possibleValues?: TemplateVariableValue[];
}

const parseBoolean = (value?: string | null): boolean => {
  if (value === undefined || value === null) return false;
  return value.toLowerCase() === 'true';
};

const VariablesView: React.FC<VariablesViewProps> = ({
  moduleId,
  onBack,
  onDataChange,
}) => {
  const [variables, setVariables] = useState<VariableWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingVariable, setIsEditingVariable] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableRequest | null>(null);
  const [editingVariableId, setEditingVariableId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const variablesService = useVariablesService();

  const parseOptions = (defaultValue?: string): string[] => {
    try {
      if (!defaultValue) return [];
      if (defaultValue.startsWith('[')) {
        return JSON.parse(defaultValue);
      }
      return defaultValue.split(',').map(o => o.trim());
    } catch {
      return [];
    }
  };

  const getEffectiveValue = (variable: VariableWithOptions) => {
    if (variable.type === VariableType.TEXT) {
      if (variable.value !== undefined && variable.value !== null && variable.value !== '') {
        return variable.value;
      }
      return variable.defaultValue ?? '';
    }

    if (variable.value !== undefined && variable.value !== null) {
      return variable.value;
    }

    return variable.defaultValue ?? '';
  };

  const loadVariables = async () => {
    try {
      setLoading(true);
      const data = await variablesService.getByModule(moduleId);

      const variablesWithOptions: VariableWithOptions[] = data.map(
        (variable: Variable): VariableWithOptions => {
          if (variable.type === VariableType.SELECTOR) {
            const options = parseOptions(variable.defaultValue);
            const possibleValues: TemplateVariableValue[] = options.map(opt => ({
              value: opt,
              label: opt,
            }));

            return {
              ...variable,
              possibleValues,
            };
          }

          return variable;
        }
      );

      setVariables(variablesWithOptions);
    } catch (error) {
      setError('Error loading variables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVariables();
  }, [moduleId]);

  const textVariables = variables.filter(v => v.type === VariableType.TEXT);
  const booleanVariables = variables.filter(v => v.type === VariableType.BOOLEAN);
  const selectorVariables = variables.filter(v => v.type === VariableType.SELECTOR);

  const handleCreateVariable = () => {
    setEditingVariable({
      type: VariableType.TEXT,
      section: '',
      name: '',
      moduleId,
      defaultValue: '',
      value: '',
    });
    setEditingVariableId(null);
    setIsEditingVariable(true);
    setError(null);
  };

  const handleEditVariable = (variable: VariableWithOptions) => {
    setEditingVariable({
      type: variable.type,
      section: variable.section,
      name: variable.name,
      moduleId: variable.moduleId,
      defaultValue: variable.defaultValue,
      value: variable.value ?? '',
    });
    setEditingVariableId(variable.id);
    setIsEditingVariable(true);
    setError(null);
  };

  const handleSaveVariable = async () => {
    if (!editingVariable) return;

    try {
      if (editingVariableId) {
        await variablesService.update(editingVariableId, editingVariable);
      } else {
        await variablesService.create().addVariable(editingVariable);
      }

      setIsEditingVariable(false);
      setEditingVariable(null);
      setEditingVariableId(null);
      setError(null);

      if (onDataChange) {
        await onDataChange();
      } else {
        await loadVariables();
      }
    } catch (err) {
      setError('Failed to save variable');
    }
  };

  const handleCloseVariableEdit = () => {
    setIsEditingVariable(false);
    setEditingVariable(null);
    setEditingVariableId(null);
    setError(null);
  };

  const handleDeleteVariable = async (variableId: number) => {
    if (!confirm('Are you sure you want to delete this variable?')) return;

    try {
      await variablesService.delete(variableId);

      if (onDataChange) {
        await onDataChange();
      } else {
        await loadVariables();
      }
    } catch (err) {
      setError('Error deleting variable');
    }
  };


  const updateVariableValue = async (variable: VariableWithOptions, newValue: string) => {
    if (variable.type === VariableType.BOOLEAN) return;

    try {
      const payload: TemplateVariableValueRequest = {
        templateVariableId: variable.id,
        value: newValue,      
        label: newValue,
      };

      await variablesService.createValue(payload);
      await loadVariables();
    } catch (error) {
      setError('Error updating variable value');
    }
  };

  const handleSelectorChange = (variable: VariableWithOptions, newValue: string) => {
    updateVariableValue(variable, newValue);
  };

  return (
    <>
      <div className="w-full py-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Variables</h1>
        </div>

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
          <Button onClick={handleCreateVariable}>
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-8">Loading variables...</div>
        )}

        {!loading && textVariables.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Text Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {textVariables.map(variable => (
                <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{variable.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVariable(variable)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVariable(variable.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 break-all">
                      {getEffectiveValue(variable)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {textVariables.length > 0 && booleanVariables.length > 0 && (
          <div className="border-t-2 border-gray-300" />
        )}

        {!loading && booleanVariables.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Boolean Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {booleanVariables.map(variable => {
                const boolValue = parseBoolean(getEffectiveValue(variable));
                return (
                  <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{variable.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVariable(variable)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVariable(variable.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`boolean-${variable.id}`}
                          checked={boolValue}
                          disabled
                          className="mr-2"
                        />
                        <label
                          htmlFor={`boolean-${variable.id}`}
                          className="text-sm text-gray-700 cursor-default"
                        >
                          {boolValue ? 'true' : 'false'}
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {(textVariables.length > 0 || booleanVariables.length > 0) &&
          selectorVariables.length > 0 && (
            <div className="border-t-2 border-gray-300" />
          )}

        {!loading && selectorVariables.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Selector Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectorVariables.map(variable => {
                const options =
                  variable.possibleValues && variable.possibleValues.length > 0
                    ? variable.possibleValues.map(pv => pv.value)
                    : parseOptions(variable.defaultValue);

                const currentValue = getEffectiveValue(variable);
                const value = options.includes(currentValue)
                  ? currentValue
                  : options[0] ?? '';

                return (
                  <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{variable.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVariable(variable)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVariable(variable.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={value}
                        onValueChange={(val) => handleSelectorChange(variable, val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {variable.possibleValues && variable.possibleValues.length > 0 ? (
                            variable.possibleValues.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))
                          ) : (
                            options.map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {variables.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            This Module doesn't have variables
          </div>
        )}
      </div>

      {isEditingVariable && editingVariable && (
        <VariableForm
          variable={editingVariable}
          onChange={setEditingVariable}
          onSave={handleSaveVariable}
          onCancel={handleCloseVariableEdit}
          title={editingVariableId ? 'Edit Variable' : 'Create Variable'}
          error={error}
        />
      )}
    </>
  );
};

export default VariablesView;
