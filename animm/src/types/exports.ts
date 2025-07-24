import { BaseApiResponse } from './baseApi';
import { Template } from './collections';

export interface ExportBatchRequest {
  id: number;
  templateId: number;
  format: string;
  userId: number;
  batchDefinitions: BatchDefinitions[];
  campaign: string;
}

export interface BatchDefinitions {
  resolutions: Resolutions[];
  variables: Variables[];
}
export interface Resolutions {
  width: number;
  height: number;
  name: string;
}
export interface Variables {
  key: string;
  value: string;
}
export interface ExportBatch {
  id: number;
  templateId: number;
  template: Template;
  format: string;
  userId: string;
  exports: Export[];
  campaign: string;
}

export interface Export {
  id: number;
  exportBatchId: number;
  url: string;
  width: number;
  height: number;
  status: ExportStatusEnum;
  campaign: string;
}

export enum ExportStatusEnum {
  Pending = 0,
  InProgress = 1,
  Finished = 2,
  Failed = 3,
}
export interface ApiExports extends BaseApiResponse<ExportBatch[]> {}
