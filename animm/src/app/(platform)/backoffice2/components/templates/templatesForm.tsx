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

  const updateThumbnail = (file: File | null) => {
    onChange({
      ...template,
      thumbnail: file,
      thumbnailPreview: file ? URL.createObjectURL(file) : '',
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateThumbnail(file);
  };

  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    updateThumbnail(file);
  };

  const updateVideo = (file: File | null) => {
    onChange({
      ...template,
      video: file,
      videoPreview: file ? URL.createObjectURL(file) : '',
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateVideo(file);
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    updateVideo(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleStaticChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...template,
      isStatic: e.target.checked,
    });
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
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer"
              onClick={() => thumbnailInput.current?.click()}
              onDrop={handleThumbnailDrop}
              onDragOver={handleDragOver}
            >
              {template.thumbnailPreview ? (
                <img
                  src={template.thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-muted-foreground">
                  Drop image or click to select
                </span>
              )}
              <input
                ref={thumbnailInput}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Video */}
          <div>
            <Label htmlFor="video">Video</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer"
              onClick={() => videoInput.current?.click()}
              onDrop={handleVideoDrop}
              onDragOver={handleDragOver}
            >
              {template.videoPreview ? (
                <video
                  src={template.videoPreview}
                  className="w-full h-full object-cover rounded-md"
                  controls={false}
                />
              ) : template.video ? (
                <span className="text-gray-700">{template.video.name}</span>
              ) : (
                <span className="text-muted-foreground">
                  Drop video or click to select
                </span>
              )}
              <input
                ref={videoInput}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Checkbox estático */}
          <div className="flex items-center gap-2">
            <input
              id="isStatic"
              type="checkbox"
              checked={!!template.isStatic}
              onChange={handleStaticChange}
              className="mr-2"
            />
            <Label htmlFor="isStatic">Is Static?</Label>
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