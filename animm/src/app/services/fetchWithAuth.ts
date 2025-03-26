'use client';
import { platformStore } from '@/stores/platformStore';

const useFetchWithAuth = () => {
  const { authenticationResponse } = platformStore(state => state);
  const token = authenticationResponse?.jwtToken;

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    const updatedOptions: RequestInit = {
      ...options,
      headers,
    };

    return fetch(url, updatedOptions);
  };

  return fetchWithAuth;
};

export default useFetchWithAuth;
