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
  path: string;
}

export enum TemplateVariableTypeEnum {
  Input,
  TextArea,
  Selector,
  Boolean,
}

export interface TemplateImage {
  image: string;
}

export interface Module {
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

export interface Template {
  id: number;
  name: string;
  thumbnail: string;
  tags: Tag[];
  modules: Module[];
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

export interface ApiCollections extends BaseApiResponse<Collection[]> {}
export interface ApiCollection extends BaseApiResponse<Collection> {}
