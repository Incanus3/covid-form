import { assign } from 'lodash';
import config from './config'

export async function request(method, path, { data = null, headers = {} } = {}) {
  const options = {
    method:  method.toUpperCase(),
    headers: assign({ 'Content-Type': 'application/json' }, headers),
  };

  if (data) {
    options['body'] = JSON.stringify(data);
  }

  const response = await fetch(config.base_url + path, options)
  console.log('received', response);
  const body     = await response.json();
  return { status: response.status, body }
}
