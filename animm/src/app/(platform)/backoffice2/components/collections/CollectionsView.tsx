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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Collection } from '@/types/collections';
import { User } from '@/types/users';
import useCollectionsService from '@/app/services/CollectionsService';
import CollectionForm from './CollectionForm';
import type { CollectionRequest } from '@/types/collections';

interface CollectionsViewProps {
  collections: Collection[];
  users: User[];
  isLoadingUsers: boolean;
  onCollectionClick: (collection: Collection) => void;
  onDataChange: () => Promise<void>;
}

export default function CollectionsView({
  collections,
  users,
  isLoadingUsers,
  onCollectionClick,
  onDataChange,
}: CollectionsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { update: updateCollection, delete: deleteCollection, create } = useCollectionsService();
  const { addCollection } = create();

  const handleCreateCollection = () => {
    setEditingCollection({
      id: 0,
      name: '',
      description: '',
      thumbnail: null,
      thumbnailPreview: '',
      userId: 0,
      templates: [],
    });
    setIsEditing(true);
    setError(null);
  };

const handleEditCollection = (collection: Collection) => {
  const requestData: CollectionRequest = {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    userId: collection.userId,
    thumbnail: null, 
    thumbnailPreview: collection.thumbnail || '', 
    templates: collection.templates,
  };
  
  setEditingCollection(requestData);
  setIsEditing(true);
  setError(null);
};

const handleSaveCollection = async () => {
  if (!editingCollection) return;

  if (editingCollection.id) {
    await updateCollection(editingCollection.id, editingCollection);
  } else {
    await addCollection(editingCollection);
  }

  setIsEditing(false);
  setEditingCollection(null);
  setError(null);
  await onDataChange();
};

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingCollection(null);
    setError(null);
  };

  const handleDeleteCollection = async (collectionId: number) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await deleteCollection(collectionId);
      await onDataChange();
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Backoffice</h1>
            <p className="text-muted-foreground">
              Manage collections, templates, and content
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Collections</h2>
            <Button onClick={handleCreateCollection}>
              <Plus className="w-4 h-4 mr-2" /> New Collection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.length === 0 ? (
            <div className="text-center text-muted-foreground col-span-full">
              No collections found
            </div>
          ) : (
            collections.map(collection => (
              <Card
                key={collection.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onCollectionClick(collection)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditCollection(collection);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteCollection(collection.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>

                  {collection.thumbnail && (
                    <div className="px-6 py-2">
                      <img
                        src={collection.thumbnail}
                        alt={`${collection.name} thumbnail`}
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
                      <span className="text-muted-foreground">Templates:</span>
                      <Badge variant="secondary">
                        {collection.templates?.length || 0}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {isEditing && editingCollection && (
        <CollectionForm
          collection={editingCollection}
          onChange={setEditingCollection}
          onSave={handleSaveCollection}
          onCancel={handleCloseEdit}
          title={editingCollection.id === 0 ? 'Create Collection' : 'Edit Collection'}
          users={users}
          isLoadingUsers={isLoadingUsers}
          error={error}
        />
      )}
    </>
  );
}