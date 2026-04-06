export interface ResponseModel<T extends OutputData> {
  outputData: T;
}

export interface OutputData {
  ARetorno: string;
  responseCode: number;
  message?: string;
};
