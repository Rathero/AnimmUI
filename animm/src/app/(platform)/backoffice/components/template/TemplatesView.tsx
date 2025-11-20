'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Collection } from '@/types/collections';
import useTemplatesService from '@/app/services/TemplatesService';
import useModulesService from '@/app/services/ModuleService';
import TemplateForm from './TemplatesForm';
import type { Template, TemplateRequest } from '@/types/collections';

interface TemplatesViewProps {
  collection: Collection;
  onBack: () => void;
  onTemplateClick: (template: Template) => void;
}

export default function TemplatesView({
  collection,
  onBack,
  onTemplateClick,
}: TemplatesViewProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { update, delete: deleteTemplate, create } = useTemplatesService();
  const { addTemplate } = create();

  const modulesService = useModulesService(); 


  const loadTemplates = async () => {
    try {
      if (!collection.templates) {
        setTemplates([]);
        return;
      }


      const templatesWithModules = await Promise.all(
        collection.templates.map(async (template) => {
          const modules = await modulesService.getByTemplate(template.id);
          return { ...template, modules };
        })
      );

      setTemplates(templatesWithModules);
    } catch (err) {
      console.error('Error loading templates/modules:', err);
    }
  };

 useEffect(() => {
  const fetchTemplatesWithModules = async () => {
    if (!collection.templates) {
      setTemplates([]);
      return;
    }

    try {
      const templatesWithModules = await Promise.all(
        collection.templates.map(async (template) => {
          const modules = await modulesService.getByTemplate(template.id);
          return { ...template, modules };
        })
      );
      setTemplates(templatesWithModules);
    } catch (err) {
      console.error('Error loading modules:', err);
      setTemplates(collection.templates.map(t => ({ ...t, modules: [] }))); 
    }
  };

  fetchTemplatesWithModules();
}, [collection]);

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: 0,
      name: '',
      thumbnail: null,
      thumbnailPreview: '',
      video: null,
      videoPreview: '',
      isStatic: false,
    });
    setIsEditingTemplate(true);
    setError(null);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate({
      id: template.id,
      name: template.name,
      thumbnail: null,
      thumbnailPreview: template.thumbnail || '',
      video: null,
      videoPreview: template.video || '',
      isStatic: !!template.static,
    });
    setIsEditingTemplate(true);
    setError(null);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    if (editingTemplate.id !== 0) {
      await update(editingTemplate.id, editingTemplate);
    } else {
      await addTemplate({
        name: editingTemplate.name,
        collectionId: collection.id,
        isStatic: editingTemplate.isStatic,
        thumbnail: editingTemplate.thumbnail,
        video: editingTemplate.video,
      });
    }
    setIsEditingTemplate(false);
    setEditingTemplate(null);
    setError(null);
    await loadTemplates(); // recargamos después de crear/editar
  };

  const handleCloseTemplateEdit = () => {
    setIsEditingTemplate(false);
    setEditingTemplate(null);
    setError(null);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(templateId);
      await loadTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Error deleting template');
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Templates in {collection.name}</h2>
        </div>

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card
              key={template.id}
              className="flex flex-row items-center p-0 hover:shadow-md transition-shadow min-h-[100px]"
            >
              <div className="flex-shrink-0 h-full w-40 rounded-l-md overflow-hidden">
                {template.thumbnail && typeof template.thumbnail === "string" && (
                  <img
                    src={template.thumbnail}
                    alt={`${template.name} thumbnail`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col justify-center pl-6 py-4 flex-grow">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                    >
                      <Edit className="w-5 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="w-5 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="mt-1">Template ID: {template.id}</CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                  Modules: <span>{template.modules?.length || 0}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-32"
                  onClick={e => {
                    e.stopPropagation();
                    onTemplateClick(template);
                  }}
                >
                  Modules
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {isEditingTemplate && editingTemplate && (
        <TemplateForm
          template={editingTemplate}
          onChange={setEditingTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCloseTemplateEdit}
          title={editingTemplate.id === 0 ? 'Create Template' : 'Edit Template'}
          error={error}
        />
      )}
    </>
  );
}
