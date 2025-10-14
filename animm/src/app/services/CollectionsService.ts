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
      description: string;
      userId: number;
      thumbnail: File | string;
      templates?: any[];
    }) => {
      const formData = new FormData();
      formData.append('Name', data.name);
      formData.append('Description', data.description);
      formData.append('UserId', data.userId.toString());
      if (data.thumbnail instanceof File) {
        formData.append('File', data.thumbnail);
      }
      // Enviar templates como JSON string si es necesario
      if (data.templates && data.templates.length > 0) {
        formData.append('Templates', JSON.stringify(data.templates));
      } else {
        formData.append('Templates', JSON.stringify([]));
      }

      const response = await fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + '/collections', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Error creating collection: ${response.statusText}`);
      }
      return await response.json();
    };
    return { addCollection };
  };

  const update = async (
    id: number,
    collection: Partial<Collection> & { thumbnail?: File | string }
  ): Promise<ApiCollection | undefined> => {
    let body;
    let headers = {};
    if (collection.thumbnail instanceof File) {
      const formData = new FormData();
      formData.append('Name', collection.name || '');
      formData.append('Description', collection.description || '');
      formData.append('UserId', collection.userId?.toString() || '0');
      formData.append('File', collection.thumbnail);
      if (collection.templates) {
        formData.append('Templates', JSON.stringify(collection.templates));
      } else {
        formData.append('Templates', JSON.stringify([]));
      }
      body = formData;
    } else {
      body = JSON.stringify({
        name: collection.name,
        description: collection.description,
        userId: collection.userId,
        thumbnail: collection.thumbnail,
        templates: collection.templates || [],
      });
      headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/collections/' + id,
      {
        method: 'PATCH',
        headers,
        body,
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
      throw new Error(`Error updating user assignment for collection ${id}: ${response.statusText}`);
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