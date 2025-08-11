'use client';
import Link from 'next/link';
import CollectionCard from '@/components/collection-card';
import { ApiCollections } from '@/types/collections';
import { useEffect, useState } from 'react';
import useCollectionsService from '@/app/services/CollectionsService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { platformStore } from '@/stores/platformStore';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<ApiCollections | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const { getAll } = useCollectionsService();
  const { setPageTitle } = platformStore(state => state);

  // Set page title
  useEffect(() => {
    setPageTitle('Projects');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

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
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        {collections.Result.map(collection => (
          <Link href={'collections/' + collection.id} key={collection.id}>
            <CollectionCard collection={collection} />
          </Link>
        ))}
      </div>
    </ContentWrapper>
  );
}
