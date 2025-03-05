import { GeneratedAnimation } from '@/types/generatedAnimations';

export const genera = {
  get: async (id: string): Promise<GeneratedAnimation | undefined> => {
    const response = await fetch(process.env.API_URL + '/animations/' + id);
    if (!response.ok) {
      return undefined;
    }

    return await response.json();
  },
  getAll: async (): Promise<GeneratedAnimation[]> => {
    const response = await fetch(process.env.API_URL + '/animations/');
    if (!response.ok) {
      return [];
    }

    return await response.json();
  },
  add: async (generatedAnimation: GeneratedAnimation) => {
    const response = await fetch(process.env.API_URL + '/animations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generatedAnimation),
    });
  },
};
