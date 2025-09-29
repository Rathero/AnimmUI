export type NewCollection = {
  name: string;
  description: string;
  thumbnail: string;
  userId: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://animmapiv2.azurewebsites.net';

export function useCollectionService() {
  const create = async (collection: NewCollection) => {
    const res = await fetch(`${API_URL}/api/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collection),
    });
    if (!res.ok) throw new Error('Error creating collection');
    return res.json();
  };

  return { create };
}