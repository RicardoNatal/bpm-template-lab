export interface ResponseModel<T extends OutputData> {
  outputData: T;
}

export class OutputData {
  message?: string;
  responseCode: number;
};

