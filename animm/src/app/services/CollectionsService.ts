'use client';
import { ApiCollection, ApiCollections, CollectionRequest } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useCollectionsService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiCollection | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id
    );
    if (!response.ok) {
      throw new Error(`Error fetching collection ${id}: ${response.statusText}`);
    }
    return await response.json();
  };

  const getAll = async (): Promise<ApiCollections | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/'
    );
    if (!response.ok) {
      throw new Error(`Error fetching all collections: ${response.statusText}`);
    }
    return await response.json();
  };

  const getAllBackoffice = async (): Promise<ApiCollections | undefined> => {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/collections/all'
    );
    if (!response.ok) {
      throw new Error(`Error fetching backoffice collections: ${response.statusText}`);
    }
    return await response.json();
  };

  const create = () => {
    const addCollection = async (data: {
      name: string;
      description?: string;
      userId: number;
      thumbnail: File | null;
      templates?: any[];
    }) => {
      const formData = new FormData();

      formData.append('Name', data.name);

      if (data.description && data.description.trim() !== '') {
        formData.append('Description', data.description);
      }

      formData.append('UserId', data.userId.toString());

      if (data.thumbnail instanceof File) {
        formData.append('File', data.thumbnail);
      }

      if (data.templates && data.templates.length > 0) {
        formData.append('Templates', JSON.stringify(data.templates));
      } else {
        formData.append('Templates', JSON.stringify([]));
      }

      const response = await fetchWithAuth(
        process.env.NEXT_PUBLIC_API_URL + '/collections',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error creating collection: ${response.statusText}`);
      }

      return await response.json();
    };

    return { addCollection };
  };

  const update = async (
    id: number,
    collection: CollectionRequest
  ): Promise<ApiCollection | undefined> => {
    const formData = new FormData();

    formData.append('Id', id.toString());
    formData.append('Name', collection.name || '');

    if (collection.description && collection.description.trim() !== '') {
      formData.append('Description', collection.description);
    }

    formData.append('UserId', collection.userId?.toString() || '0');

    if (collection.thumbnail) {
      formData.append('File', collection.thumbnail);
    }

    formData.append('Templates', JSON.stringify(collection.templates || []));

    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id,
      {
        method: 'PATCH',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating collection ${id}: ${response.statusText}`);
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
      throw new Error(
        `Error updating user assignment for collection ${id}: ${response.statusText}`
      );
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
    if (!response.ok) {
      throw new Error(`Error deleting collection ${id}: ${response.statusText}`);
    }
    return true;
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
