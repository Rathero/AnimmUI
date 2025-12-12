'use client';
import { ApiVariables, Variable, VariableRequest } from '@/types/collections';
import useFetchWithAuth from './fetchWithAuth';

const useVariablesService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<ApiVariables | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL +
        '/TemplateVariables/' +
        id +
        '/TemplateVariablesValues'
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching variable ${id}: ${response.statusText}`
      );
    }

    return await response.json();
  };

  const getByModule = async (moduleId: number): Promise<Variable[]> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL +
        '/Modules/' + moduleId + '/TemplateVariables'
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching variables for module ${moduleId}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data?.Result || [];
  };

  const create = () => {
    const addVariable = async (data: VariableRequest) => {
      const response = await fetchWithAuth(
        process.env.NEXT_PUBLIC_API_URL + '/TemplateVariables',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error creating variable: ${response.statusText}`
        );
      }

      return await response.json();
    };

    return { addVariable };
  };

  const update = async (
    id: number,
    variable: VariableRequest
  ): Promise<ApiVariables | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/TemplateVariables/' + id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variable),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error updating variable ${id}: ${response.statusText}`
      );
    }

    return await response.json();
  };

  const deleteVariable = async (id: number): Promise<boolean> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/TemplateVariables/' + id,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error deleting variable ${id}: ${response.statusText}`
      );
    }

    return true;
  };

  return {
    get,
    getByModule,
    create,
    update,
    delete: deleteVariable,
  };
};

export default useVariablesService;