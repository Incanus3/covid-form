import { mapKeys } from 'lodash';

export function camelToSnakeCase(string) {
  return string.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function keysToSnakeCase(object) {
  return mapKeys(object, (_value, key) => camelToSnakeCase(key));
}
