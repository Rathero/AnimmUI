'use client';
import { useState } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Collection, Module, ModuleTypeEnum } from '@/types/collections';
import useModulesService from '@/app/services/ModuleService';
import ModuleForm from './modulesForm'; 

interface ModulesViewProps {
  collection: Collection;
  onBack: () => void;
  onDataChange: () => Promise<void>;
  onModuleClick: (module: Module) => void;
}

export default function ModulesView({
  collection,
  onBack,
  onDataChange,
  onModuleClick,
}: ModulesViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getByCollection, create, update, delete: deleteModule } = useModulesService();

  const handleCreateModule = () => {
    setEditingModule({
      id: 0,
      moduleType: ModuleTypeEnum.Image,
      file: '',
      variables: [],
      images: [],
    });
    setIsEditing(true);
    setError(null);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setIsEditing(true);
    setError(null);
  };

  const handleSaveModule = async () => {
    if (!editingModule) return;

    try {
      if (editingModule.id === 0) {
        await create(editingModule);
      } else {
        await update(editingModule.id, editingModule);
      }
      setIsEditing(false);
      setEditingModule(null);
      setError(null);
      await onDataChange();
    } catch (err) {
      console.error('Error saving module:', err);
      setError('Error saving module');
    }
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
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
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modules in {collection.name}</h2>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
          </Button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button onClick={handleCreateModule}>
            <Plus className="w-4 h-4 mr-2" /> New Module
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {collection.templates?.flatMap(t => t.modules)?.length === 0 ? (
            <div className="text-center text-muted-foreground col-span-full">
              No modules found
            </div>
          ) : (
            collection.templates?.flatMap(t => t.modules)?.map((module: Module) => (
              <Card
                key={module.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onModuleClick(module)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{module.file}</CardTitle>
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

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Variables:</span>
                      <Badge variant="secondary">{module.variables?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Images:</span>
                      <Badge variant="secondary">{module.images?.length || 0}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={e => {
                        e.stopPropagation();
                        onModuleClick(module);
                      }}
                    >
                      Open Module
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {isEditing && editingModule && (
        <ModuleForm
          module={editingModule}
          onChange={setEditingModule}
          onSave={handleSaveModule}
          onCancel={handleCloseEdit}
          title={editingModule.id === 0 ? 'Create Module' : 'Edit Module'}
          error={error}
        />
      )}
    </>
  );
}
