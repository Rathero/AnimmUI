'use client';
import { ApiExports } from '@/types/exports';
import useFetchWithAuth from './fetchWithAuth';

const useExportsService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const getAll = async (
    templateId: number | undefined
  ): Promise<ApiExports | undefined> => {
    var url = process.env.NEXT_PUBLIC_API_URL + '/export/';
    if (templateId) {
      url += '?templateId=' + templateId;
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  return { getAll };
};

export default useExportsService;
