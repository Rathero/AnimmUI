import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Template } from '@/types/collections';
import useModulesService from '@/app/services/ModuleService';
import ModuleForm from './modulesForm';
import type { Module, ModuleRequest } from '@/types/collections';

interface ModulesViewProps {
  template: Template;
  onBack: () => void;
  onDataChange: () => Promise<void>;
  
}

export default function ModulesView({
  template,
  onBack,
  onDataChange,
  
}: ModulesViewProps) {
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { update, delete: deleteModule, create } = useModulesService();
  const { addModule } = create();

  const handleCreateModule = () => {
    setEditingModule({
      id: 0,
      file: null,
      filePreview: '',
    });
    setIsEditingModule(true);
    setError(null);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule({
      id: module.id,
      file: null,
      filePreview: module.file || '',
    });
    setIsEditingModule(true);
    setError(null);
  };

  const handleSaveModule = async () => {
    if (!editingModule) return;

    if (editingModule.id && editingModule.id !== 0) {
      await update(editingModule.id, editingModule);
    } else {
      await addModule({
        file: editingModule.file,
        templateId: template.id,
      });
    }

    setIsEditingModule(false);
    setEditingModule(null);
    setError(null);
    await onDataChange();
  };

  const handleCloseModuleEdit = () => {
    setIsEditingModule(false);
    setEditingModule(null);
    setError(null);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await deleteModule(moduleId);
      await onDataChange();
    } catch (err) {
      console.error('Error deleting module:', err);
      setError('Error deleting module');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modules in {template.name}</h2>
        </div>
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <Button onClick={handleCreateModule}>
            <Plus className="w-4 h-4 mr-2" />
            New Module
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {template.modules?.length === 0 ? (
            <div className="text-center text-muted-foreground col-span-full">
              No modules found
            </div>
          ) : (
            template.modules?.map(module => (
              <Card
                key={module.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditModule(module);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Module ID: {module.id}</CardDescription>
                </CardHeader>
                {typeof module.file === 'object' && module.file && (
                  <div className="px-6 py-2">
                    <img
                      src={URL.createObjectURL(module.file)}
                      alt="Module thumbnail"
                      className="w-full h-32 object-cover rounded-md"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      
                    }}
                  >
                    Open Module
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {isEditingModule && editingModule && (
        <ModuleForm
          module={editingModule}
          onChange={setEditingModule}
          onSave={handleSaveModule}
          onCancel={handleCloseModuleEdit}
          title={editingModule.id === 0 ? 'Create Module' : 'Edit Module'}
          error={error}
        />
      )}
    </>
  );
}