'use client';
import { ApiTemplate, Template, TemplateRequest } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useTemplatesService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiTemplate | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/Templates/' + id
    );
    if (!response.ok) {
      throw new Error(`Error fetching template ${id}: ${response.statusText}`);
    }
    return await response.json();
  };

  const getByCollection = async (collectionId: number): Promise<Template[]> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL +
        '/Collections/' +
        collectionId +
        '/Templates'
    );
    if (!response.ok) {
      throw new Error(`Error fetching templates for collection ${collectionId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data?.Result || [];
  };

  const create = () => {
    const addTemplate = async (data: {
      name: string;
      collectionId: number;
      isStatic: boolean;
      thumbnail: File | null;
      video: File | null;
    }) => {
      const formData = new FormData();

      formData.append('Name', data.name);
      formData.append('CollectionId', data.collectionId.toString());
      formData.append('IsStatic', String(data.isStatic));

      if (data.thumbnail instanceof File) {
        formData.append('Thumbnail', data.thumbnail);
      }

      if (data.video instanceof File) {
        formData.append('Video', data.video);
      }

      const response = await fetchWithAuth(
        process.env.NEXT_PUBLIC_API_URL + '/Templates',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error creating template: ${response.statusText}`);
      }

      return await response.json();
    };

    return { addTemplate };
  };

  const update = async (
    id: number,
    template: TemplateRequest
  ): Promise<ApiTemplate | undefined> => {
    const formData = new FormData();

    formData.append('Id', id.toString());
    formData.append('Name', template.name || '');
    formData.append('IsStatic', String(template.isStatic));

    if (template.thumbnail) {
      formData.append('Thumbnail', template.thumbnail);
    }

    if (template.video) {
      formData.append('Video', template.video);
    }

    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/Templates/' + id,
      {
        method: 'PATCH',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating template ${id}: ${response.statusText}`);
    }

    return await response.json();
  };

  const deleteTemplate = async (id: number): Promise<boolean> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/Templates/' + id,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error(`Error deleting template ${id}: ${response.statusText}`);
    }
    return true;
  };

  return {
    get,
    getByCollection,
    create,
    update,
    delete: deleteTemplate,
  };
};

export default useTemplatesService;
