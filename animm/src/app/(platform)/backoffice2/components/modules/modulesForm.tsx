'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import type { ModuleRequest } from '@/types/collections';

interface ModuleFormProps {
  module: ModuleRequest;
  onChange: (module: ModuleRequest) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  error?: string | null;
}

export default function ModuleForm({
  module,
  onChange,
  onSave,
  onCancel,
  title,
  error,
}: ModuleFormProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  const updateFile = (file: File | null) => {
    onChange({
      ...module,
      file: file,
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
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <Label htmlFor="file">Thumbnail</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => fileInput.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {module.file ? (
                <div className="text-center p-4">
                  <img
                    src={URL.createObjectURL(module.file)}
                    alt="Thumbnail preview"
                    className="max-h-20 mx-auto mb-2"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {module.file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(module.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Suelta aquí o haz click para seleccionar imagen
                </span>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
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
