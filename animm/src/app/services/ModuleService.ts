'use client';
import { ApiModules, Module, ModuleRequest } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useModulesService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiModules | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/Modules/' + id
    );
    if (!response.ok) {
      throw new Error(`Error fetching module ${id}: ${response.statusText}`);
    }
    return await response.json();
  };

  const getByTemplate = async (templateId: number): Promise<Module[]> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + 
      '/Templates/' + 
      templateId +
      '/Modules'
    );
    if (!response.ok) {
      throw new Error(`Error fetching modules for template ${templateId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data?.Result || [];
  };

  const create = () => {
    const addModule = async (data: {
      file: File | null;
      templateId: number;
    }) => {
      const formData = new FormData();

      formData.append('TemplateId', data.templateId.toString());

      if (data.file instanceof File) {
        formData.append('File', data.file);
      }

      const response = await fetchWithAuth(
        process.env.NEXT_PUBLIC_API_URL + '/Modules/module',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error creating module: ${response.statusText}`);
      }

      return await response.json();
    };

    return { addModule };
  };

  const update = async (
    id: number,
    module: ModuleRequest
  ): Promise<ApiModules | undefined> => {
    const formData = new FormData();

    formData.append('Id', id.toString());

    if (module.file) {
      formData.append('File', module.file);
    }

    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/Modules/' + id,
      {
        method: 'PATCH',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating module ${id}: ${response.statusText}`);
    }

    return await response.json();
  };

  const deleteModule = async (id: number): Promise<boolean> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/Modules/' + id,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error(`Error deleting module ${id}: ${response.statusText}`);
    }
    return true;
  };

  return {
    get,
    getByTemplate,
    create,
    update,
    delete: deleteModule,
  };
};

export default useModulesService;