import { useState } from 'react';
import {
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      templates: [],
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
                className="flex flex-row items-center p-0 hover:shadow-md transition-shadow min-h-[100px]"
              >
                {/* Imagen al lado izquierdo */}
                <div className="flex-shrink-0 h-full w-40 rounded-l-md overflow-hidden">
                  {collection.thumbnail && (
                    <img
                      src={collection.thumbnail}
                      alt={`${collection.name} thumbnail`}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                {/* Contenido al lado derecho */}
                <div className="flex flex-col justify-center pl-6 py-4 flex-grow">
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
                        <Edit className="w-5 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteCollection(collection.id);
                        }}
                      >
                        <Trash2 className="w-5 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="mt-1">{collection.description}</CardDescription>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Templates: <span>{collection.templates?.length || 0}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-32"
                    onClick={e => {
                      e.stopPropagation();
                      onCollectionClick(collection);
                    }}
                  >
                    Templates
                  </Button>
                </div>
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
