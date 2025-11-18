import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import VariableForm, { Variable } from './variablesForm';

interface VariablesViewProps {
  variables: Variable[];
  onBack: () => void;
  onDataChange: () => Promise<void>;
  title?: string;
}

export default function VariablesView({
  variables,
  onBack,
  onDataChange,
  title = 'Variables',
}: VariablesViewProps) {
  const [isEditingVariable, setIsEditingVariable] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateVariable = () => {
    setEditingVariable({
      id: 0,
      name: '',
      value: '',
      isStatic: false,
    });
    setIsEditingVariable(true);
    setError(null);
  };

  const handleEditVariable = (variable: Variable) => {
    setEditingVariable({
      id: variable.id,
      name: variable.name,
      value: variable.value,
      isStatic: variable.isStatic,
    });
    setIsEditingVariable(true);
    setError(null);
  };

  const handleSaveVariable = async () => {
    if (!editingVariable) return;

    setIsEditingVariable(false);
    setEditingVariable(null);
    setError(null);
    await onDataChange();
  };

  const handleCloseVariableEdit = () => {
    setIsEditingVariable(false);
    setEditingVariable(null);
    setError(null);
  };

  const handleDeleteVariable = async (variableId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta variable?')) return;
    try {
      await onDataChange();
    } catch (err) {
      console.error('Error deleting variable:', err);
      setError('Error al eliminar la variable');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button onClick={handleCreateVariable}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Variable
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variables?.length === 0 ? (
            <div className="text-center text-muted-foreground col-span-full">
              No se encontraron variables
            </div>
          ) : (
            variables?.map(variable => (
              <Card
                key={variable.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{variable.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditVariable(variable);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteVariable(variable.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {variable.isStatic ? 'Variable estática' : 'Variable dinámica'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Valor:</span> {variable.value}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {isEditingVariable && editingVariable && (
        <VariableForm
          variable={editingVariable}
          onChange={setEditingVariable}
          onSave={handleSaveVariable}
          onCancel={handleCloseVariableEdit}
          title={editingVariable.id === 0 ? 'Crear Variable' : 'Editar Variable'}
          error={error}
        />
      )}
    </>
  );
}