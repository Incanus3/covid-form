import { mapKeys           } from 'lodash';
import { format, formatISO } from 'date-fns';
import csLocale              from 'date-fns/locale/cs';

export function camelToSnakeCase(string: string): string {
  return string.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function snakeToCamelCase(string: string): string {
  return string.replace(
    /([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', '')
  )
}

export function keysToCamelCase(object: Record<string, any>): Record<string, any> {
  return mapKeys(object, (_value, key) => snakeToCamelCase(key));
}

export function keysToSnakeCase(object: Record<string, any>): Record<string, any> {
  return mapKeys(object, (_value, key) => camelToSnakeCase(key));
}

export function formatDate(date: Date): string {
  return formatISO(date, { representation: 'date' })
}

export function formatDateHuman(date: Date): string {
  return format(date, 'PP', { locale: csLocale })
}
