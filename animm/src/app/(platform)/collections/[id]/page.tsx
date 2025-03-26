'use client';
import useCollectionsService from '@/app/services/CollectionsService';
import { HeaderPage } from '@/components/header-page';
import TemplateElement from '@/components/template-card';
import { ApiCollection } from '@/types/collections';
import { useEffect, useState } from 'react';

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const [collection, setCollection] = useState<ApiCollection | undefined>(
    undefined
  );
  const { get } = useCollectionsService();

  const fetchCollections = async () => {
    params.then(async x => {
      const coll = await get(x.id);
      setCollection(coll);
    });
  };

  useEffect(() => {
    fetchCollections();
  }, []);

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
