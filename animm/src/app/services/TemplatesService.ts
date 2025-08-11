'use client';
import { ApiTemplate, Template } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useTemplatesService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiTemplate | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/templates/' + id
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const getByCollection = async (collectionId: number): Promise<Template[]> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL +
        '/collections/' +
        collectionId +
        '/templates'
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data?.Result || [];
  };

  const create = async (
    template: Omit<Template, 'id'>
  ): Promise<ApiTemplate | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/templates/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const update = async (
    id: number,
    template: Partial<Template>
  ): Promise<ApiTemplate | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/templates/' + id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const deleteTemplate = async (id: number): Promise<boolean> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/templates/' + id,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  return { get, getByCollection, create, update, delete: deleteTemplate };
};

export default useTemplatesService;
