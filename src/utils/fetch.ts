import { assign } from 'lodash';

export interface RequestOptions {
  params?:  Record<string, string>,
  headers?: Record<string, string>,
  data?:    Record<string, any>,
}

export async function request(
  method: string, path: string, { params, data, headers = {} }: RequestOptions = {}
): Promise<Response> {
  // console.log(`making ${method} request to ${path} with`, params);

  const url = new URL(path);
  const baseHeaders: HeadersInit = { 'Content-Type': 'application/json' };

  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const options: RequestInit = {
    method:  method.toUpperCase(),
    headers: assign(baseHeaders, headers),
  };

  if (data) {
    // console.log('data:', data);

    options.body = JSON.stringify(data);
  }

  const response = await fetch(url.toString(), options);

  // console.log('received', response, await getResponseData(response));

  return response;
}

export async function getResponseData(response: Response): Promise<any> {
  return isJsonResponse(response) ? await response.clone().json() : response.clone().text();
}

export function isJsonResponse(response: Response): boolean {
  return response.headers.get('Content-Type') === 'application/json';
}
