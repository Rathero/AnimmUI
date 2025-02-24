import { ApiTemplate } from '@/types/collections';

export const templatesService = {
  get: async (id: string): Promise<ApiTemplate | undefined> => {
    const response = await fetch(process.env.API_URL + '/templaets/' + id);
    if (!response.ok) {
      return undefined;
    }

    return await response.json();
  },
};
