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
import TemplateForm from './TemplatesForm';
import type { Template, TemplateRequest } from '@/types/collections';

interface TemplatesViewProps {
  collection: Collection;
  onBack: () => void;
  onTemplateClick: (template: Template) => void;
  onDataChange?: () => Promise<void>; 
}

export default function TemplatesView({
  collection,
  onBack,
  onTemplateClick,
  onDataChange,
}: TemplatesViewProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { update, delete: deleteTemplate, create } = useTemplatesService();
  const { addTemplate } = create();

  const loadTemplates = async () => {
    try {
      if (!collection.templates) {
        setTemplates([]);
        return;
      }
      setTemplates(collection.templates);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  useEffect(() => {
    loadTemplates();
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

    try {
      if (editingTemplate.id && editingTemplate.id !== 0) {
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

      if (onDataChange) {
        await onDataChange();
      } else {
        await loadTemplates();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save template');
    }
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

      if (onDataChange) {
        await onDataChange();
      } else {
        await loadTemplates();
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Error deleting template');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Backoffice</h1>
            <p className="text-muted-foreground">
              Manage templates and modules
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Templates in {collection.name}</h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collections
            </Button>
            <Button onClick={handleCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.length === 0 ? (
              <div className="text-center text-muted-foreground col-span-full py-8">
                No templates found in this collection
              </div>
            ) : (
              templates.map(template => (
                <Card
                  key={template.id}
                  className="flex flex-col lg:flex-row items-stretch lg:items-center p-0 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="lg:flex-shrink-0 w-full lg:w-40 h-48 lg:h-full lg:min-h-[100px] overflow-hidden bg-gray-100">
                    {template.thumbnail && typeof template.thumbnail === "string" ? (
                      <img
                        src={template.thumbnail}
                        alt={`${template.name} thumbnail`}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex flex-col justify-between p-4 lg:p-6 flex-grow">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg line-clamp-1 pr-2">{template.name}</CardTitle>
                        <div className="flex items-center space-x-1 flex-shrink-0 -mt-1 lg:-mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={e => {
                              e.stopPropagation();
                              handleEditTemplate(template);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 mb-3 lg:mb-4">
                        Template ID: {template.id}
                      </CardDescription>
                    </div>
                    
                    {/* Botón de Modules  */}
                    <div className="mt-2 lg:mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full lg:w-auto lg:min-w-[120px]"
                        onClick={e => {
                          e.stopPropagation();
                          onTemplateClick(template);
                        }}
                      >
                        Modules
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
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