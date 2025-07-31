'use client';
import Link from 'next/link';
import { HeaderPage } from '@/components/header-page';
import CollectionCard from '@/components/collection-card';
import { ApiCollections } from '@/types/collections';
import { useEffect, useState } from 'react';
import useCollectionsService from '@/app/services/CollectionsService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<ApiCollections | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useCollectionsService();

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const coll = await getAll();
      setCollections(coll);
    } catch (error) {
      console.error('Error fetching collections:', error);
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
        <HeaderPage
          title="Projects"
          desc="Here we will display your Collections"
        />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!collections) return <></>;
  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage
        title="Projects"
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
