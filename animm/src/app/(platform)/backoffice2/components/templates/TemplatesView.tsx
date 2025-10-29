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
import { Collection } from '@/types/collections';
import TemplateForm from './templatesForm';

interface TemplateRequest {
  id?: number;
  name: string;
  file: File | null;
  filePreview: string;
}

interface TemplatesViewProps {
  collection: Collection;
  onBack: () => void;
  onDataChange: () => Promise<void>;
  onTemplateClick: (template: any) => void;
}

export default function TemplatesView({
  collection,
  onBack,
  onDataChange,
  onTemplateClick
}: TemplatesViewProps) {
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: 0,
      name: '',
      file: null,
      filePreview: '',
    });
    setIsEditingTemplate(true);
    setError(null);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate({
      id: template.id,
      name: template.name,
      file: null,
      filePreview: '',
    });
    setIsEditingTemplate(true);
    setError(null);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      console.log('Saving template:', editingTemplate);

      setIsEditingTemplate(false);
      setEditingTemplate(null);
      setError(null);
      await onDataChange();
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Error saving template');
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
      console.log('Deleting template:', templateId);
      await onDataChange();
    } catch (err) {
      console.error('Error deleting template:', err);
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
          {collection.templates?.map(template => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTemplateClick(template)}
            >
              <CardHeader>
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
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Template ID: {template.id}</CardDescription>
              </CardHeader>

              {template.thumbnail && (
                <div className="px-6 py-2">
                  <img
                    src={template.thumbnail}
                    alt={`${template.name} thumbnail`}
                    className="w-full h-32 object-cover rounded-md"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Modules:</span>
                    <Badge variant="secondary">
                      {template.modules?.length || 0}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onTemplateClick(template);}}>
                    Modules
                  </Button>
                </div>
              </CardContent>
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