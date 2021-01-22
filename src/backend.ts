import config from './config';

import { request as genericRequest, RequestOptions } from 'src/utils/fetch';

export type { RequestOptions };

export async function request(
  method: string, path: string, options: RequestOptions = {}
): Promise<Response> {
  return genericRequest(method, config.base_url + path, options);
}
