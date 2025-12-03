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
    templates: collection.templates || [], 
  };
  setEditingCollection(requestData);
  setIsEditing(true);
  setError(null);
};

const handleSaveCollection = async () => {
  if (!editingCollection) return;

  try {
    if (editingCollection.id && editingCollection.id !== 0) {
      await updateCollection(editingCollection.id, editingCollection);
    } else {
      await addCollection(editingCollection);
    }
    setIsEditing(false);
    setEditingCollection(null);
    setError(null);
    await onDataChange();
  } catch (err) {
    console.error(err);
    setError('Failed to save collection');
  }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {collections.length === 0 ? (
            <div className="text-center text-muted-foreground col-span-full">
              No collections found
            </div>
          ) : (
            collections.map(collection => (
              <Card
                key={collection.id}
                className="flex flex-col lg:flex-row items-stretch lg:items-center p-0 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="lg:flex-shrink-0 w-full lg:w-40 h-48 lg:h-full lg:min-h-[100px] overflow-hidden bg-gray-100">
                  {collection.thumbnail ? (
                    <img
                      src={collection.thumbnail}
                      alt={`${collection.name} thumbnail`}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
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
                      <CardTitle className="text-lg line-clamp-1 pr-2">{collection.name}</CardTitle>
                      <div className="flex items-center space-x-1 flex-shrink-0 -mt-1 lg:-mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
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
                          className="h-8 w-8 p-0"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 mb-3 lg:mb-4">
                      {collection.description || 'No description'}
                    </CardDescription>
                  </div>
                  
                  {/* Botón de Templates */}
                  <div className="mt-2 lg:mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full lg:w-auto lg:min-w-[120px]"
                      onClick={e => {
                        e.stopPropagation();
                        onCollectionClick(collection);
                      }}
                    >
                      Templates
                    </Button>
                  </div>
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