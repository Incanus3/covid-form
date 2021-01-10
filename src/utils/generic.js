import { mapKeys   } from 'lodash';
import { formatISO } from 'date-fns';

import { getResponseData } from './fetch';

export function camelToSnakeCase(string) {
  return string.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function keysToSnakeCase(object) {
  return mapKeys(object, (_value, key) => camelToSnakeCase(key));
}

export function formatDate(date) {
  return formatISO(date, { representation: 'date' })
}

export class Result {
  constructor(data) {
    this.data = data;
  }

  static async fromResponse(response) {
    const constructor = response.ok ? Success : Failure;

    return new constructor(await getResponseData(response));
  }

  transform(transformer) {
    return new this.constructor(transformer(this.data))
  }

  async asyncTransform(transformer) {
    return new this.constructor(await transformer(this.data))
  }

  transformFailure(transformer) {
    if (this.isSuccess) { return this }

    return this.transform(transformer)
  }

  async asyncTransformFailure(transformer) {
    if (this.isSuccess) { return this }

    return await this.asyncTransform(transformer)
  }
}

export class Success extends Result {
  isSuccess = true;
  isFailure = false;
}

export class Failure extends Result {
  isSuccess = false;
  isFailure = true;
}
