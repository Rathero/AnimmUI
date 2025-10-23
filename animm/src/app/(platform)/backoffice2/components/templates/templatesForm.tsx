'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface TemplateRequest {
  name: string;
  file: File | null;
  filePreview: string;
}

interface TemplateFormProps {
  template: TemplateRequest;
  onChange: (template: TemplateRequest) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  error?: string | null;
}

export default function TemplateForm({
  template,
  onChange,
  onSave,
  onCancel,
  title,
  error,
}: TemplateFormProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const updateFile = (file: File | null) => {
    onChange({
      ...template,
      file: file,
      filePreview: file ? URL.createObjectURL(file) : '',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    updateFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
         
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={template.name}
              onChange={e =>
                onChange({ ...template, name: e.target.value })
              }
              placeholder="Enter template name"
            />
          </div>

          <div>
            <Label htmlFor="file">Thumbnail</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => hiddenFileInput.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {template.filePreview ? (
                <div className="text-center p-4">
                  <p className="text-sm font-medium text-gray-700">
                    {template.file?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {template.file?.size ? `${(template.file.size / 1024).toFixed(2)} KB` : ''}
                  </p>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Drop file or click to select
                </span>
              )}
              <input
                ref={hiddenFileInput}
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="file">Video</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => hiddenFileInput.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {template.filePreview ? (
                <div className="text-center p-4">
                  <p className="text-sm font-medium text-gray-700">
                    {template.file?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {template.file?.size ? `${(template.file.size / 1024).toFixed(2)} KB` : ''}
                  </p>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Drop file or click to select
                </span>
              )}
              <input
                ref={hiddenFileInput}
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4">
            <Button onClick={onSave}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}