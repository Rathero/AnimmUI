'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { platformStore } from '@/stores/platformStore';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Collection } from '@/types/collections';
import useCollectionsService from '@/app/services/CollectionsService';
import { User } from '@/types/users';
import useUsersService from '@/app/services/UsersService';
import CollectionForm from './components/collections/CollectionForm';


export default function NewBackofficePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // Usamos any para permitir thumbnailFile
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const { setPageTitle } = platformStore(state => state);
  const {
    getAllBackoffice: getAllBackoffice,
    update: updateCollection,
    delete: deleteCollection,
    create,
  } = useCollectionsService();
  const { addCollection } = create();
  const { getAll: getAllUsers } = useUsersService();

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setFetchError(null);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData?.Result || []);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error fetching users';
      console.error('Error fetching users:', error);
      setFetchError(errMsg);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateCollection = () => {
    setEditingItem({
      id: 0,
      name: '',
      description: '',
      thumbnail: '',
      thumbnailFile: null,
      userId: 0,
      templates: [],
    });
    setIsEditing(true);
    setError(null);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingItem({
      ...collection,
      thumbnailFile: null,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleSaveCollection = async () => {
    if (!editingItem) return;
    try {
      if (!editingItem.name) {
        setError('Name is required');
        return;
      }

      const collectionData = {
        name: editingItem.name,
        description: editingItem.description,
        thumbnail: editingItem.thumbnailFile || editingItem.thumbnail, // Enviar File o string
        userId: editingItem.userId,
      };

      if (editingItem.id === 0) {
        await addCollection(collectionData);
      } else {
        await updateCollection(editingItem.id, collectionData);
      }

      setIsEditing(false);
      setEditingItem(null);
      setError(null);
      await fetchData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save collection';
      setError(errMsg);
      console.error('Error saving collection:', err);
    }
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    setError(null);
  };

  const handleDeleteCollection = async (collectionId: number) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      await deleteCollection(collectionId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting collection:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error deleting collection');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [collectionsData] = await Promise.all([getAllBackoffice()]);
      setCollections(collectionsData?.Result || []);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error fetching data';
      console.error('Error fetching data:', error);
      setFetchError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPageTitle('Backoffice');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      {fetchError && (
        <Alert variant="destructive">
          <AlertTitle>Error fetching data</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Backoffice</h1>
            <p className="text-muted-foreground">
              Manage collections, templates, and content
            </p>
          </div>
        </div>

        {/* Botón de nueva colección */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Collections</h2>
            <Button onClick={handleCreateCollection}>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </div>
        </div>

        {/* Grid de colecciones */}
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
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                    </div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      // TODO: implementar create template
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {isEditing && editingItem && (
        <CollectionForm
          collection={editingItem}
          onChange={setEditingItem}
          onSave={handleSaveCollection}
          onCancel={handleCloseEdit}
          title={editingItem.id === 0 ? 'Create Collection' : 'Edit Collection'}
          users={users}
          isLoadingUsers={isLoadingUsers}
          error={error}
        />
      )}
    </ContentWrapper>
  );
}