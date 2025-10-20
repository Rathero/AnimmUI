import { BaseApiResponse } from './baseApi';

export interface TemplateVariableValue {
  value: string;
  label: string;
}

export interface TemplateVariable {
  type: TemplateVariableTypeEnum;
  section: string;
  name: string;
  possibleValues: TemplateVariableValue[];
  defaultValue: string;
  paths: TemplateVariablePath[];
  value: string;
  id: number;
}

export interface TemplateVariablePath {
  path: string;
}

export enum TemplateVariableTypeEnum {
  Input,
  TextArea,
  Selector,
  Boolean,
}

export interface TemplateImage {
  id: number;
  image: string;
}

export interface Module {
  id: number;
  moduleType: ModuleTypeEnum;
  file: string;
  variables: TemplateVariable[];
  images: TemplateImage[];
}

export enum ModuleTypeEnum {
  Rive,
  Video,
  Image,
}

export interface Tag {
  name: string;
}
export interface ApiTemplate extends BaseApiResponse<Template> {}

export interface Product {
  id: number;
  name: string;
}

export interface Language {
  id: number;
  name: string;
}

export interface Template {
  id: number;
  name: string;
  thumbnail: string;
  tags: Tag[];
  modules: Module[];
  video: string;
  static: boolean;
  templateCompositions: TemplateComposition[];
  products?: Product[];
  languages?: Language[];
}

export interface TemplateComposition {
  id: number;
  name: string;
  templateResolutions: TemplateResolution[];
}

export interface TemplateResolution {
  id: number;
  name: string;
  width: number;
  height: number;
  format: TemplateResolutionFormat;
}

export enum TemplateResolutionFormat {
  Png,
  Mp4,
  Pdf,
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  thumbnail: string | File | null;
  userId: number;
  templates: any[];
  thumbnailPreview?: string;
}

export interface CollectionRequest {
  id?: number;
  name: string;
  description?: string;
  userId: number;
  thumbnail: File | null;
  templates?: any[];
  thumbnailPreview?: string;
}


export interface ApiCollections extends BaseApiResponse<Collection[]> {}
export interface ApiCollection extends BaseApiResponse<Collection> {}
