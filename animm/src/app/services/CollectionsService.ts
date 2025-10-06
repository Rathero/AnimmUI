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
  
  const getAllBackoffice = async (): Promise<ApiCollections | undefined> => {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/collections/all'
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const create = () => {
    const addCollection = async (data: {
      name: string;
      description: string;
      userId: number;
      thumbnail: string;
      animation?: string;
    }) => {
      await fetchWithAuth (process.env.NEXT_PUBLIC_API_URL + '/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    };
    return {addCollection};
  };

  const update = async (
    id: number,
    collection: Partial<Collection>
  ): Promise<ApiCollection | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id,
      {
        method: 'PATCH',
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

  const updateUserAssignment = async (
    id: number,
    userId: number
  ): Promise<ApiCollection | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id + '/user',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
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


  return {
    get,
    getAll,
    getAllBackoffice,
    create,
    update,
    updateUserAssignment,
    delete: deleteCollection,
  };
};

export default useCollectionsService;
