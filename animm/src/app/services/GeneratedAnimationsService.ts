'use client';
import { GeneratedAnimation } from '@/types/generatedAnimations';
import useFetchWithAuth from './fetchWithAuth';
import { BaseApiResponse } from '@/types/baseApi';

const useGeneratedAnimationService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const get = async (id: string): Promise<GeneratedAnimation | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/users/animations/' + id
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const getAll = async (): Promise<
    BaseApiResponse<GeneratedAnimation[]> | undefined
  > => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/users/animations/'
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const add = async (generatedAnimation: GeneratedAnimation) => {
    await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/users/animations/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedAnimation),
      }
    );
  };

  return { get, getAll, add };
};

export default useGeneratedAnimationService;
