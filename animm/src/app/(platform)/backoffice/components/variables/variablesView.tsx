'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import useVariablesService from '@/app/services/VariableService';
import { Variable, VariableRequest } from '@/types/collections';

interface VariablesViewProps {
  moduleId: number;
  goBackToModules: () => void;
}

const VariableType = {
  TEXT: 0,
  BOOLEAN: 1,
  SELECTOR: 2
};

const VariablesView: React.FC<VariablesViewProps> = ({ moduleId, goBackToModules }) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const variablesService = useVariablesService();

  useEffect(() => {
    const loadVariables = async () => {
      try {
        setLoading(true);
        const data = await variablesService.getByModule(moduleId);
        setVariables(data);
      } catch (error) {
        console.error('Error loading variables:', error);
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <p className="text-center text-gray-500">Cargando variables...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header con botón de volver */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Variables del Módulo</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={goBackToModules}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Módulos
        </Button>
      </div>

      {/* Sección de Variables de Texto */}
      {textVariables.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Variables de Texto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {textVariables.map(variable => (
              <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{variable.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 break-all">{variable.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Separador */}
      {textVariables.length > 0 && booleanVariables.length > 0 && (
        <div className="border-t-2 border-gray-300"></div>
      )}

      {/* Sección de Variables Booleanas */}
      {booleanVariables.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Variables Booleanas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {booleanVariables.map(variable => (
              <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{variable.name}</CardTitle>
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

      {/* Separador */}
      {(textVariables.length > 0 || booleanVariables.length > 0) && selectorVariables.length > 0 && (
        <div className="border-t-2 border-gray-300"></div>
      )}

      {/* Sección de Variables con Selector */}
      {selectorVariables.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Variables de Selección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectorVariables.map(variable => {
              const options = parseOptions(variable.DefaultValue);
              return (
                <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{variable.name}</CardTitle>
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
                        {options.map(option => (
                          <SelectItem key={option} value={option}>
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

      {/* Mensaje si no hay variables */}
      {variables.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          This Module don't have variables
        </div>
      )}
    </div>
  );
};

export default VariablesView;