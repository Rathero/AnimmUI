'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import type { TemplateRequest } from '@/types/collections';

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
  const thumbnailInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const updateFile = (fileIndex: number, file: File | null) => {
    const files = template.file ? [...template.file] : [null, null];
    files[fileIndex] = file!
    onChange({
      ...template,
      file: files,
      filePreview: files[0] ? URL.createObjectURL(files[0]) : '',
    });
  };

  const handleFileChange =
    (fileIndex: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      updateFile(fileIndex, file);
    };

  const handleDrop =
    (fileIndex: number) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0] ?? null;
      updateFile(fileIndex, file);
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

          {/* Thumbnail */}
          <div>
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => thumbnailInput.current?.click()}
              onDrop={handleDrop(0)}
              onDragOver={handleDragOver}
            >
              {template.file && template.file[0] ? (
                <div className="text-center p-4">
                  <img
                    src={URL.createObjectURL(template.file[0])}
                    alt="Thumbnail preview"
                    className="max-h-20 mx-auto mb-2"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {template.file[0].name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(template.file[0].size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Suelta aquí o haz click para seleccionar imagen
                </span>
              )}
              <input
                ref={thumbnailInput}
                type="file"
                accept="image/*"
                onChange={handleFileChange(0)}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Video */}
          <div>
            <Label htmlFor="video">Video</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => videoInput.current?.click()}
              onDrop={handleDrop(1)}
              onDragOver={handleDragOver}
            >
              {template.file && template.file[1] ? (
                <div className="text-center p-4">
                  <p className="text-sm font-medium text-gray-700">
                    {template.file[1].name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(template.file[1].size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Suelta aquí o haz click para seleccionar video
                </span>
              )}
              <input
                ref={videoInput}
                type="file"
                accept="video/*"
                onChange={handleFileChange(1)}
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
