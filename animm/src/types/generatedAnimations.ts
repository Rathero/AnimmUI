import {
  Module,
  ModuleTypeEnum,
  Template,
  TemplateImage,
  TemplateVariable,
} from './collections';

export interface GeneratedAnimation {
  baseTemplateId: number;
  baseTemplate: Template;
  name: string;
  image: string;
  folder: string;
  status: GeneraetdAnimationStatusEnum;
  modules: GeneratedModule[];
}

export interface GeneratedModule {
  moduleType: ModuleTypeEnum;
  baseModuleId: number;
  baseModule: Module;
  file: string;
  variables: GeneratedTemplateVariable[];
  images: GeneratedTemplateImage[];
}

export interface GeneratedTemplateImage {
  tepmlateImageId: number;
  templateImage: TemplateImage;
  image: string;
}

export interface GeneratedTemplateVariable {
  tepmlateVariableId: number;
  templateVariable: TemplateVariable;
  value: string;
}

export enum GeneraetdAnimationStatusEnum {
  NoStatus,
  ToReview,
  Reviewed,
  Approved,
  OnHold,
}
