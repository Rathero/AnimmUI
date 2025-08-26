'use client';
import { ApiUsers, User } from '@/types/users';

const useUsersService = () => {
  const getAll = async (): Promise<ApiUsers | undefined> => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users');
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  };

  return {
    getAll,
  };
};

export default useUsersService;
