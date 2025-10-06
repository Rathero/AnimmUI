'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { platformStore } from '@/stores/platformStore';
import NewCollectionButton from './components/collections/NewCollection';
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
import useCollectionsService from '@/app/services/CollectionsService';


export default function NewBackofficePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Collection | null>(null);
  const [editMode, setEditMode] = useState<
    'collection' | 'template' | 'module' | 'variable'
  >('collection');

  const { setPageTitle } = platformStore(state => state);
  const {
    getAllBackoffice: getAllBackoffice,
    update: updateCollection,
    delete: deleteCollection,
  } = useCollectionsService();

  const handleEditCollection = (collection: Collection) => {
    setEditingItem({ ...collection });
    setEditMode('collection');
    setIsEditing(true);
    updateCollection(collection.id, collection).catch(error => {
      console.error('Error updating collection:', error);
    });
  };

  const handleDeleteCollection = async (collectionId: number) => {
  if (!confirm('Are you sure you want to delete this collection?')) return;

  try {
    await deleteCollection(collectionId);  
    await fetchData(); 
  } catch (error) {
    console.error('Error deleting collection:', error);
  }
};


  useEffect(() => {
    setPageTitle('Backoffice');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [collectionsData] = await Promise.all([
        getAllBackoffice(),
      
      ]);
      setCollections(collectionsData?.Result || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <NewCollectionButton onCreated={fetchData} />

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
                      <CardTitle className="text-lg">
                        {collection.name}
                      </CardTitle>
                      
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
    </ContentWrapper>
  );
}
