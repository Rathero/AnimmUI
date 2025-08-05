'use client';
import useCollectionsService from '@/app/services/CollectionsService';
import TemplateElement from '@/components/template-card';
import { ApiCollection } from '@/types/collections';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { platformStore } from '@/stores/platformStore';

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const [collection, setCollection] = useState<ApiCollection | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const { get } = useCollectionsService();
  const { setPageTitle } = platformStore(state => state);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const resolvedParams = await params;
      const coll = await get(resolvedParams.id);
      setCollection(coll);

      // Set page title when collection is loaded
      if (coll?.Result?.name) {
        setPageTitle(coll.Result.name);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set page title
  useEffect(() => {
    setPageTitle('Loading...');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

  useEffect(() => {
    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="h-full flex items-center justify-center">
        No collection found
      </div>
    );
  }

  if (
    !collection.Result?.templates ||
    collection.Result.templates.length === 0
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        No templates found in this collection
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="w-full grid grid-cols-1 3xl:grid-cols-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4">
          {collection.Result.templates.map(template => (
            <TemplateElement key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
}
