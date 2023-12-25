/**
* Copyright (c) 2023 - present TinyEngine Authors.
* Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
*
* Use of this source code is governed by an MIT-style license.
*
* THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
* BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
* A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
*
*/
export class ApiError extends Error {
  status: number;
  msg: string;
  code: string;
  data: any;
  constructor(message: string, status: string | number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = Number(status) || 400;
    this.msg = message || '';
    this.code = code || `${status}`;
    this.data = data || null;
  }
}

export const apiError = (message: string, status: number, code?: string, data?: any): ApiError => {
  return new ApiError(message, status, code, data);
};

export const throwApiError = (message: string, status: number, code?: string, data?: any) => {
  throw new ApiError(message, status, code, data);
};