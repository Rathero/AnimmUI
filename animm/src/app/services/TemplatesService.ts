'use client';
import { ApiTemplate } from '@/types/collections';
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

  return { get };
};

export default useTemplatesService;
