'use client';
import { ApiCollection, ApiCollections, Collection } from '@/types/collections';
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

  const create = async (
    collection: Omit<Collection, 'id'>
  ): Promise<ApiCollection | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collection),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const update = async (
    id: number,
    collection: Partial<Collection>
  ): Promise<ApiCollection | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collection),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const deleteCollection = async (id: number): Promise<boolean> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  return { get, getAll, create, update, delete: deleteCollection };
};

export default useCollectionsService;
