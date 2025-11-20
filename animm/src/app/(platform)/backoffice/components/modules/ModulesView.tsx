'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,

} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

import { Template } from '@/types/collections';
import useModulesService from '@/app/services/ModuleService';
import ModuleForm from './ModuleForm';
import RiveComp from '@/components/editor/rive-component';
import type { Module, ModuleRequest } from '@/types/collections';

interface ModulesViewProps {
  template: Template;
  onBack: () => void;
  onDataChange: () => Promise<void>;
  onModuleClick: (module: Module) => void;
}

export default function ModulesView({
  template,
  onBack,
  onDataChange,
  onModuleClick,
}: ModulesViewProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingModule, setIsEditingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getByTemplate, update, delete: deleteModule, create } = useModulesService();
  const { addModule } = create();

  const loadModules = async () => {
    try {
      setIsLoading(true);
      const result = await getByTemplate(template.id);
      setModules(result || []);
    } catch (err) {
      console.error('Error loading modules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [template.id]);

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

    try {
      if (editingModule.id !== 0) {
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

      await loadModules();
      await onDataChange();
    } catch (err) {
      console.error('Error saving module:', err);
      setError('Error saving module');
    }
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
      await loadModules();
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
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!isLoading && modules.length === 0 && (
            <div className="text-center text-muted-foreground col-span-full">
              No modules found
            </div>
          )}

          {!isLoading &&
            modules.map((module) => (
              <Card
                key={module.id}
                className="flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onModuleClick(module)}
              >
                {/* Animación .riv */}
                {module.file && (
                  <div className="w-full h-48">
                    <RiveComp
                      src={module.file}
                      setAssetsParent={() => {}}
                      setRiveStatesParent={() => {}}
                      autoplay={true}
                      artboard="Template"
                    />
                  </div>
                )}

                <CardContent className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Module {module.id}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModule(module);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Variables:</span>
                    <Badge variant="secondary">{module.variables?.length || 0}</Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onModuleClick(module);
                    }}
                  >
                    Variables
                  </Button>
                </CardContent>
              </Card>
            ))}
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
