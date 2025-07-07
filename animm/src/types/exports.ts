import { BaseApiResponse } from './baseApi';
import { Template } from './collections';

export interface ExportBatch {
  id: number;
  templateId: number;
  template: Template;
  format: string;
  userId: string;
  exports: Export[];
}

export interface Export {
  id: number;
  exportBatchId: number;
  url: string;
  width: number;
  height: number;
  status: ExportStatusEnum;
}

export enum ExportStatusEnum {
  Pending = 0,
  InProgress = 1,
  Finished = 2,
  Failed = 3,
}
export interface ApiExports extends BaseApiResponse<ExportBatch[]> {}
