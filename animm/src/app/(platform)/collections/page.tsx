'use client';
import Link from 'next/link';
import { HeaderPage } from '@/components/header-page';
import CollectionCard from '@/components/collection-card';
import { ApiCollections } from '@/types/collections';
import { useEffect, useState } from 'react';
import useCollectionsService from '@/app/services/CollectionsService';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<ApiCollections | undefined>(
    undefined
  );
  const { getAll } = useCollectionsService();

  const fetchCollections = async () => {
    const coll = await getAll();
    setCollections(coll);
  };
  useEffect(() => {
    fetchCollections();
  }, []);

  if (!collections) return <></>;
  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage
        title="Library"
        desc="Here we will display your Collections"
      />
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {collections.Result.map(collection => (
          <Link href={'collections/' + collection.id} key={collection.id}>
            <CollectionCard collection={collection} />
          </Link>
        ))}
      </div>
    </div>
  );
}
