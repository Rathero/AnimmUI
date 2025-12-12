'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import useVariablesService from '@/app/services/VariableService';
import { Variable, VariableRequest } from '@/types/collections';
import VariableForm from './variablesForm';

interface VariablesViewProps {
  moduleId: number;
  onBack: () => void;
  onDataChange?: () => Promise<void>;
}

const VariableType = {
  TEXT: 0,
  BOOLEAN: 1,
  SELECTOR: 2
};

const VariablesView: React.FC<VariablesViewProps> = ({ 
  moduleId,
  onBack,
  onDataChange, 
}) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingVariable, setIsEditingVariable] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableRequest | null>(null);
  const [editingVariableId, setEditingVariableId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectorOptions, setSelectorOptions] = useState<{[key: number]: string[]}>({});
  
  const variablesService = useVariablesService();

  const loadVariables = async () => {
    try {
      setLoading(true);
      const data = await variablesService.getByModule(moduleId);
      setVariables(data);
      
      const selectorVars = data.filter(v => v.type === VariableType.SELECTOR);
      const optionsMap: {[key: number]: string[]} = {};
      
      for (const variable of selectorVars) {
        try {
          const options = parseOptions(variable.DefaultValue);
          optionsMap[variable.id] = options;
        } catch (error) {
          console.error(`Error loading options for variable ${variable.id}:`, error);
          optionsMap[variable.id] = [];
        }
      }
      
      setSelectorOptions(optionsMap);
    } catch (error) {
      console.error('Error loading variables:', error);
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

  const parseOptions = (defaultValue: string): string[] => {
    try {
      if (defaultValue.startsWith('[')) {
        return JSON.parse(defaultValue);
      }
      return defaultValue.split(',').map(opt => opt.trim());
    } catch {
      return [defaultValue];
    }
  };

  const handleCreateVariable = () => {
    setEditingVariable({
      type: VariableType.TEXT,
      section: '',
      name: '',
      moduleId: moduleId,
      DefaultValue: '',
      value: ''
    });
    setEditingVariableId(null);
    setIsEditingVariable(true);
    setError(null);
  };

  const handleEditVariable = (variable: Variable) => {
    setEditingVariable({
      type: variable.type,
      section: variable.section,
      name: variable.name,
      moduleId: variable.moduleId,
      DefaultValue: variable.DefaultValue,
      value: variable.value
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
        const createService = variablesService.create();
        await createService.addVariable(editingVariable);
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
      console.error('Error saving variable:', err);
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
      console.error('Error deleting variable:', err);
      setError('Error deleting variable');
    }
  };

  const handleBooleanChange = async (variable: Variable, newValue: string) => {
    try {
      const updateData: VariableRequest = {
        type: variable.type,
        section: variable.section,
        name: variable.name,
        moduleId: variable.moduleId,
        DefaultValue: variable.DefaultValue,
        value: newValue
      };

      await variablesService.update(variable.id, updateData);

      setVariables(prev =>
        prev.map(v => (v.id === variable.id ? { ...v, value: newValue } : v))
      );
    } catch (error) {
      console.error('Error updating boolean variable:', error);
    }
  };

  const handleSelectorChange = async (variable: Variable, newValue: string) => {
    try {
      const updateData: VariableRequest = {
        type: variable.type,
        section: variable.section,
        name: variable.name,
        moduleId: variable.moduleId,
        DefaultValue: variable.DefaultValue,
        value: newValue
      };

      await variablesService.update(variable.id, updateData);

      setVariables(prev =>
        prev.map(v => (v.id === variable.id ? { ...v, value: newValue } : v))
      );
    } catch (error) {
      console.error('Error updating selector variable:', error);
    }
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

        {textVariables.length > 0 && (
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
                    <p className="text-gray-600 break-all">{variable.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {textVariables.length > 0 && booleanVariables.length > 0 && (
          <div className="border-t-2 border-gray-300"></div>
        )}

        {booleanVariables.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Boolean Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {booleanVariables.map(variable => (
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
                      value={variable.value}
                      onValueChange={(value) => handleBooleanChange(variable, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(textVariables.length > 0 || booleanVariables.length > 0) && selectorVariables.length > 0 && (
          <div className="border-t-2 border-gray-300"></div>
        )}

        {selectorVariables.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Selector Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectorVariables.map(variable => {
                const options = selectorOptions[variable.id] || parseOptions(variable.DefaultValue);
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
                        value={variable.value}
                        onValueChange={(value) => handleSelectorChange(variable, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
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
