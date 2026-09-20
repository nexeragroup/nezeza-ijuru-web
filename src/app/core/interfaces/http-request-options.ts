import type { ApiRequestOptions } from '../models/api-request-options.model';

export type { ApiHeaderValue as HttpHeaderValue, ApiParamValue as HttpParamValue } from '../models/api-request-options.model';
export type HttpRequestOptions = ApiRequestOptions;

export interface DownloadRequestOptions extends HttpRequestOptions {
  responseType: 'blob';
}

export interface TextRequestOptions extends HttpRequestOptions {
  responseType: 'text';
}

export interface FullResponseRequestOptions extends HttpRequestOptions {
  observe: 'response';
}
