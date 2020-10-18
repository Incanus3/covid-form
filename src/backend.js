import 'core-js/stable/url';
import { assign } from 'lodash';
import config from './config'

export async function request(method, path, { params = null, data = null, headers = {} } = {}) {
  const url = new URL(config.base_url + path);

  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const options = {
    method:  method.toUpperCase(),
    headers: assign({ 'Content-Type': 'application/json' }, headers),
  };

  if (data) {
    options['body'] = JSON.stringify(data);
  }

  const response = await fetch(url, options)
  console.log('received', response);
  const body     = await response.json();
  return { status: response.status, body }
}
