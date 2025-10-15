'use client';

import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User } from '@/types/users';

// Alinear con useCollectionsService.tsx
interface Collection {
  name: string;
  description: string;
  userId: number;
  thumbnail: File | null;
  thumbnailPreview?: string;
  templates?: any[];
}

interface CollectionFormProps {
  collection: Partial<Collection>;
  onChange: (collection: Partial<Collection>) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  users: User[];
  isLoadingUsers: boolean;
  error?: string | null;
}

export default function CollectionForm({
  collection = {},
  onChange,
  onSave,
  onCancel,
  title,
  users,
  isLoadingUsers,
  error,
}: CollectionFormProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      onChange({ ...collection, thumbnail: null, thumbnailPreview: undefined });
      return;
    }
    const file = e.target.files[0];
    onChange({ ...collection, thumbnail: file, thumbnailPreview: URL.createObjectURL(file) });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      onChange({ ...collection, thumbnail: null, thumbnailPreview: undefined });
      return;
    }
    const file = e.dataTransfer.files[0];
    onChange({ ...collection, thumbnail: file, thumbnailPreview: URL.createObjectURL(file) });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {collection.userId !== 0 &&
            users.find(user => user.id === collection.userId) && (
              <Badge variant="outline" className="text-xs mt-2">
                {users.find(user => user.id === collection.userId)?.email}
              </Badge>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={collection.name ?? ''}
              onChange={e => onChange({ ...collection, name: e.target.value })}
              placeholder="Enter collection name"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={collection.description ?? ''}
              onChange={e => onChange({ ...collection, description: e.target.value })}
              placeholder="Enter collection description"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <Label htmlFor="thumbnail">Thumbnail</Label>
            <div
              className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer"
              onClick={() => hiddenFileInput.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {collection.thumbnailPreview || collection.thumbnail ? (
                <img
                  src={collection.thumbnailPreview || collection.thumbnail}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-muted-foreground">
                  Drop image or click to select
                </span>
              )}
              <input
                ref={hiddenFileInput}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* User selector */}
          <div>
            <Label htmlFor="userId">User</Label>
            {isLoadingUsers ? (
              <LoadingSpinner size="sm" />
            ) : (
              <select
                id="userId"
                value={collection.userId ?? 0}
                onChange={e => onChange({ ...collection, userId: parseInt(e.target.value) || 0 })}
                className="w-full border rounded px-2 py-1"
              >
                <option value={0}>Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Buttons */}
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