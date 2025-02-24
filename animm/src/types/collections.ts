export interface Template {
  id: number;
  name: string;
  thumbnail: string;
  tags: string[];
  modules: any[];
  video: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  userId: number;
  templates: Template[];
}

export interface ApiCollections {
  Result: Collection[];
}
export interface ApiCollection {
  Result: Collection;
}
