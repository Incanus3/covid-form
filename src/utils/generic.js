import { mapKeys   } from 'lodash';
import { formatISO } from 'date-fns';

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
}

export class Success extends Result {
  isSuccess = true;
  isFailure = false;

  constructor(data) {
    super();
    this.data = data;
  }
}

export class Failure extends Result {
  isSuccess = false;
  isFailure = true;

  constructor(error) {
    super();
    this.error = error;
  }
}
