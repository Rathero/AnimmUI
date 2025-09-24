'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { platformStore } from '@/stores/platformStore';
import NewCollectionButton from './components/collections/NewCollectionButton';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
} from 'lucide-react';
import { Collection } from '@/types/collections';




export default function NewBackofficePage() {
  const [collections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setPageTitle } = platformStore(state => state);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // Set page title
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

  if (!collections) {
    return (
      <ContentWrapper>
        <div className="flex-1 flex items-center justify-center">
          No collections found
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
      
      <NewCollectionButton /> 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                  {collections.map(collection => (
                      <Card
                        key={collection.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        //onClick={() => goToTemplates(collection)}
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
                                // onClick={e => { e.stopPropagation();handleEditCollection(collection);}}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                /*onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteCollection(collection.id);
                                }}*/
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription>{collection.description}</CardDescription>
                        </CardHeader>
                      </Card>
                  ))}
      </div>
      </div>
    </ContentWrapper>
  );
}
