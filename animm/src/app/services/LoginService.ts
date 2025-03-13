import { ApiAuthenticationResponse } from '@/types/authenticationResponse';

export const loginService = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiAuthenticationResponse | undefined> => {
    const response = await fetch(
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
  },
  logout: async (token: string): Promise<void> => {
    const response = await fetch(
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
  },
};
