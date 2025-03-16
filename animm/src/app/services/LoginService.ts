'use client';
import { ApiAuthenticationResponse } from '@/types/authenticationResponse';
import useFetchWithAuth from './fetchWithAuth';

const useLoginService = () => {
  const fetchWithAuth = useFetchWithAuth();

  const login = async (
    email: string,
    password: string
  ): Promise<ApiAuthenticationResponse | undefined> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/authentication/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  const logout = async (token: string): Promise<void> => {
    const response = await fetchWithAuth(
      process.env.NEXT_PUBLIC_API_URL + '/authentication/logout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      }
    );
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  return { login, logout };
};

export default useLoginService;
