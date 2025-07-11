'use client';
import { ApiExports, ExportBatchRequest } from '@/types/exports';
import useFetchWithAuth from './fetchWithAuth';

const useExportsService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const createExportBatch = async (
    exportBatchRequest: ExportBatchRequest
  ): Promise<ApiExports | undefined> => {
    var url = process.env.NEXT_PUBLIC_API_URL + '/export/';
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportBatchRequest),
    });
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };
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

  return { getAll, createExportBatch };
};

export default useExportsService;
