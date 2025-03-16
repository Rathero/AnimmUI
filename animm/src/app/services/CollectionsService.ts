'use client';
import { ApiCollection, ApiCollections } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useCollectionsService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiCollection | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const getAll = async (): Promise<ApiCollections | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/'
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  return { get, getAll };
};

export default useCollectionsService;
