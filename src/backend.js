import config                        from './config';
import { request as genericRequest } from 'src/utils/fetch';

export async function request(method, path, options = {}) {
  return genericRequest(method, config.base_url + path, options);
}
