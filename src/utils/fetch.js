import { assign } from 'lodash';

export async function request(method, path, { params = null, data = null, headers = {} } = {}) {
  console.log(`making ${method} request to ${path} with`, params);

  const url = new URL(path);

  if (params) {
    url.search = new URLSearchParams(params).toString();
  }

  const options = {
    method:  method.toUpperCase(),
    headers: assign({ 'Content-Type': 'application/json' }, headers),
  };

  if (data) {
    console.log('data:', data);

    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  console.log('received', response, await getResponseData(response));

  return response;
}

export async function getResponseData(response) {
  return isJsonResponse(response) ? await response.clone().json() : response.clone().text();
}

export function isJsonResponse(response) {
  return response.headers.get('Content-Type') === 'application/json';
}
