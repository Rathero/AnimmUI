'use client';
import { ApiModules, Module } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useModulesService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiModules | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/modules/' + id
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const getByCollection = async (collectionId: number): Promise<Module[]> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL +
        '/collections/' +
        collectionId +
        '/modules'
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data?.Result || [];
  };

  const create = async (
    module: Omit<Module, 'id'>
  ): Promise<ApiModules | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/modules/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(module),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const update = async (
    id: number,
    module: Partial<Module>
  ): Promise<ApiModules | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/modules/' + id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(module),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const deleteModule = async (id: number): Promise<boolean> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/modules/' + id,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  };

  return { get, getByCollection, create, update, delete: deleteModule };
};

export default useModulesService;
