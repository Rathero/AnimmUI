'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ContentWrapper } from '@/components/ui/content-wrapper';
import { platformStore } from '@/stores/platformStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Collection } from '@/types/collections';
import useCollectionsService from '@/app/services/CollectionsService';
import { User } from '@/types/users';
import useUsersService from '@/app/services/UsersService';
import CollectionsView from './components/collections/CollectionsView';
import TemplatesView from './components/templates/TemplatesView';

export default function NewBackofficePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [viewMode, setViewMode] = useState<'collections' | 'templates'>('collections');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const { setPageTitle } = platformStore(state => state);
  const { getAllBackoffice } = useCollectionsService();
  const { getAll: getAllUsers } = useUsersService();

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData?.Result || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const collectionsData = await getAllBackoffice();
      setCollections(collectionsData?.Result || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPageTitle('Backoffice');
    fetchUsers();
    fetchData();
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

  const goToTemplates = (collection: Collection) => {
    setSelectedCollection(collection);
    setViewMode('templates');
  };

  const goToCollections = () => {
    setSelectedCollection(null);
    setViewMode('collections');
  };

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
      {viewMode === 'collections' && (
        <CollectionsView
          collections={collections}
          users={users}
          isLoadingUsers={isLoadingUsers}
          onCollectionClick={goToTemplates}
          onDataChange={fetchData}
        />
      )}

      {viewMode === 'templates' && selectedCollection && (
        <TemplatesView
          collection={selectedCollection}
          onBack={goToCollections}
          onDataChange={fetchData}
        />
      )}
    </ContentWrapper>
  );
}
