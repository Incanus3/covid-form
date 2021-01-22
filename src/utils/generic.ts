import { mapKeys   } from 'lodash';
import { formatISO } from 'date-fns';

export function camelToSnakeCase(string: string): string {
  return string.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function keysToSnakeCase(object: Record<string, any>): Record<string, any> {
  return mapKeys(object, (_value, key) => camelToSnakeCase(key));
}

export function formatDate(date: Date): string {
  return formatISO(date, { representation: 'date' })
}
