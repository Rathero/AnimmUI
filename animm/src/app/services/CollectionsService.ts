import { ApiCollection, ApiCollections } from "@/types/collections";

export const collectionsService = {
  get: async(id: string): Promise<ApiCollection | undefined> => {
    const response =  await fetch(
      process.env.API_URL + "/collections/" + id
    );
    if (!response.ok) {
      return undefined;
    }

    return await response.json();
  },
  getAll: async(): Promise<ApiCollections | undefined> => {
    const response =  await fetch(
      process.env.API_URL + "/collections/"
    );
    if (!response.ok) {
      return undefined;
    }

    return await response.json();
  }
};