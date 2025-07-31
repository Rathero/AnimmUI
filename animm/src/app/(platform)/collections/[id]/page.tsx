'use client';
import useCollectionsService from '@/app/services/CollectionsService';
import { HeaderPage } from '@/components/header-page';
import TemplateElement from '@/components/template-card';
import { ApiCollection } from '@/types/collections';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const [collection, setCollection] = useState<ApiCollection | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const { get } = useCollectionsService();

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const resolvedParams = await params;
      const coll = await get(resolvedParams.id);
      setCollection(coll);
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-4">
        <HeaderPage title="Loading..." desc="" />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!collection) return <></>;
  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage
        title={collection.Result.name}
        desc={collection.Result.description}
      />
      <div className="w-full grid grid-cols-1 3xl:grid-cols-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4 p-4">
        {collection.Result.templates.map(template => (
          <TemplateElement key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
