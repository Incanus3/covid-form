import { assign } from 'lodash';
import config from './config'

export async function request(method, path, { params = null, data = null, headers = {} } = {}) {
  console.log(`making ${method} request to ${path} with`, params);

  const url = new URL(config.base_url + path);

  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const options = {
    method:  method.toUpperCase(),
    headers: assign({ 'Content-Type': 'application/json' }, headers),
  };

  if (data) {
    console.log('data:', data, JSON.stringify(data));

    options['body'] = JSON.stringify(data);
  }

  return await fetch(url, options);
}

export async function jsonRequest(method, path, { params = null, data = null, headers = {} } = {}) {
  const response = await request(method, path, { params, data, headers });
  const body     = await response.json();

  console.log('received', response, body);

  return { status: response.status, response, body };
}
