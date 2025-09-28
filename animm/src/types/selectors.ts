export interface TemplateSelector {
  TemplateId: number;
  Name: string;
  Values: string[];
  ImagesToChange: ImageMapping[];
  TextToChange?: TextMapping[];
}

export interface TextMapping {
  [key: string]: string[];
}

export interface ImageMapping {
  [key: string]: string[];
}

export interface SelectorsConfig {
  selectors: TemplateSelector[];
}
